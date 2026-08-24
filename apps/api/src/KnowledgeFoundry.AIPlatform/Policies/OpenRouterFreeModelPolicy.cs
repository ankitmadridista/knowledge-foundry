using KnowledgeFoundry.AIPlatform.Models;
using KnowledgeFoundry.Domain.PromptTemplates.Enums;
using Microsoft.Extensions.Configuration;
using System.Net.Http.Headers;
using System.Text.Json;

namespace KnowledgeFoundry.AIPlatform.Policies;

internal sealed class OpenRouterFreeModelPolicy : IFreeModelPolicy
{
    private readonly HttpClient _httpClient;
    private readonly string? _apiKey;

    public AiProvider Provider => AiProvider.OpenRouter;

    public OpenRouterFreeModelPolicy(HttpClient httpClient, IConfiguration configuration)
    {
        _httpClient = httpClient;
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

        try
        {
            var request = new HttpRequestMessage(HttpMethod.Get, "https://openrouter.ai/api/v1/models");
            if (!string.IsNullOrWhiteSpace(_apiKey))
            {
                request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", _apiKey);
            }

            var response = await _httpClient.SendAsync(request, cancellationToken);
            if (!response.IsSuccessStatusCode) return FreeModelResult.Unknown;

            var json = await response.Content.ReadAsStringAsync(cancellationToken);
            using var document = JsonDocument.Parse(json);

            if (!document.RootElement.TryGetProperty("data", out var dataArray))
                return FreeModelResult.Unknown;

            foreach (var element in dataArray.EnumerateArray())
            {
                var id = element.GetProperty("id").GetString();
                if (id != modelId) continue;

                // Model found. Now we strictly verify the pricing.
                if (!element.TryGetProperty("pricing", out var pricing))
                    return FreeModelResult.Unknown;

                // Rule 2: Multi-dimensional zero-cost check
                // We ensure prompt and completion exist, and verify NO dimension costs > 0.
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

            // Model not found in the provider's catalog
            return FreeModelResult.Unknown;
        }
        catch
        {
            // Fail-closed on network timeouts, JSON parsing errors, etc.
            return FreeModelResult.Unknown;
        }
    }

    private static bool IsStrictlyZero(JsonElement element)
    {
        var value = element.ValueKind == JsonValueKind.String
            ? element.GetString()
            : element.GetRawText();

        return value == "0" || value == "0.0" || value == "-1"; // OpenRouter sometimes uses -1 for free/unmetered
    }
}
