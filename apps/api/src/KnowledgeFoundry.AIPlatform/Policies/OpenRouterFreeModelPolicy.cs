using KnowledgeFoundry.AIPlatform.Models;
using KnowledgeFoundry.Domain.PromptTemplates.Enums;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Configuration;
using System.Net.Http.Headers;
using System.Text.Json;

namespace KnowledgeFoundry.AIPlatform.Policies;

internal sealed class OpenRouterFreeModelPolicy : IFreeModelPolicy
{
    private readonly HttpClient _httpClient;
    private readonly IMemoryCache _cache;
    private readonly string? _apiKey;

    public AiProvider Provider => AiProvider.OpenRouter;

    public OpenRouterFreeModelPolicy(HttpClient httpClient, IConfiguration configuration, IMemoryCache cache)
    {
        _httpClient = httpClient;
        _cache = cache;
        _apiKey = configuration["OpenRouter:ApiKey"];
    }

    public async Task<FreeModelResult> EvaluateAsync(string modelId, CancellationToken cancellationToken = default)
    {
        // Rule 1: Fast-fail models that don't even claim to be free
        if (!modelId.EndsWith(":free", StringComparison.OrdinalIgnoreCase) &&
            !modelId.Equals("openrouter/free", StringComparison.OrdinalIgnoreCase))
        {
            return FreeModelResult.NotFree;
        }

        // Fetch the entire evaluated catalog from Cache (or generate it if missing)
        var catalogCache = await GetEvaluatedCatalogAsync(cancellationToken);

        if (catalogCache.TryGetValue(modelId, out var result))
        {
            return result;
        }

        return FreeModelResult.Unknown;
    }

    private async Task<Dictionary<string, FreeModelResult>> GetEvaluatedCatalogAsync(CancellationToken cancellationToken)
    {
        return await _cache.GetOrCreateAsync("policy:catalog:openrouter", async entry =>
        {
            entry.AbsoluteExpirationRelativeToNow = TimeSpan.FromMinutes(5);
            var results = new Dictionary<string, FreeModelResult>(StringComparer.OrdinalIgnoreCase);

            try
            {
                var request = new HttpRequestMessage(HttpMethod.Get, "https://openrouter.ai/api/v1/models");
                if (!string.IsNullOrWhiteSpace(_apiKey))
                    request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", _apiKey);

                var response = await _httpClient.SendAsync(request, cancellationToken);
                if (!response.IsSuccessStatusCode) return results; // Return empty dict on failure (Fail-Closed)

                var json = await response.Content.ReadAsStringAsync(cancellationToken);
                using var document = JsonDocument.Parse(json);

                if (!document.RootElement.TryGetProperty("data", out var dataArray)) return results;

                foreach (var element in dataArray.EnumerateArray())
                {
                    var id = element.GetProperty("id").GetString();
                    if (string.IsNullOrEmpty(id)) continue;

                    results[id] = EvaluatePricingElement(element);
                }
            }
            catch
            {
                // Network or parse error. The empty dictionary ensures everything evaluates to Unknown.
            }

            return results;
        }) ?? new Dictionary<string, FreeModelResult>();
    }

    private static FreeModelResult EvaluatePricingElement(JsonElement element)
    {
        if (!element.TryGetProperty("pricing", out var pricing))
            return FreeModelResult.Unknown;

        if (!pricing.TryGetProperty("prompt", out var promptElement) || !IsStrictlyZero(promptElement))
            return FreeModelResult.NotFree;

        if (!pricing.TryGetProperty("completion", out var completionElement) || !IsStrictlyZero(completionElement))
            return FreeModelResult.NotFree;

        if (pricing.TryGetProperty("request", out var requestElement) && !IsStrictlyZero(requestElement))
            return FreeModelResult.NotFree;

        if (pricing.TryGetProperty("image", out var imageElement) && !IsStrictlyZero(imageElement))
            return FreeModelResult.NotFree;

        return FreeModelResult.Free;
    }

    private static bool IsStrictlyZero(JsonElement element)
    {
        var value = element.ValueKind == JsonValueKind.String ? element.GetString() : element.GetRawText();
        return value == "0" || value == "0.0" || value == "-1";
    }
}
