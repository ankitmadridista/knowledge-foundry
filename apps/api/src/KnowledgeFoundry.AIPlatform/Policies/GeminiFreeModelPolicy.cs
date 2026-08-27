using KnowledgeFoundry.AIPlatform.Models;
using KnowledgeFoundry.Domain.PromptTemplates.Enums;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Configuration;
using System.Net.Http.Headers;
using System.Text.Json;

namespace KnowledgeFoundry.AIPlatform.Policies;

internal sealed class GeminiFreeModelPolicy : IFreeModelPolicy
{
    private readonly HttpClient _httpClient;
    private readonly IMemoryCache _cache;
    private readonly string? _apiKey;
    private readonly HashSet<string> _authorizedFreeModels;

    public AiProvider Provider => AiProvider.Gemini;

    public GeminiFreeModelPolicy(HttpClient httpClient, IConfiguration configuration, IMemoryCache cache)
    {
        _httpClient = httpClient;
        _cache = cache;
        _apiKey = configuration["Gemini:ApiKey"];

        var modelsFromConfig = configuration.GetSection("Gemini:AuthorizedFreeModels").Get<string[]>() ?? Array.Empty<string>();
        _authorizedFreeModels = new HashSet<string>(modelsFromConfig, StringComparer.OrdinalIgnoreCase);
    }

    public async Task<FreeModelResult> EvaluateAsync(string modelId, bool isDynamicDiscoveryEnabled, CancellationToken cancellationToken = default)
    {
        if (_authorizedFreeModels.Count == 0) return FreeModelResult.Unknown;
        if (!_authorizedFreeModels.Contains(modelId)) return FreeModelResult.NotFree;

        if (!isDynamicDiscoveryEnabled) return FreeModelResult.Free;

        var onlineModels = await GetOnlineModelsAsync(cancellationToken);
        if (onlineModels.Contains(modelId)) return FreeModelResult.Free;

        return FreeModelResult.Unknown;
    }

    private async Task<HashSet<string>> GetOnlineModelsAsync(CancellationToken cancellationToken)
    {
        return await _cache.GetOrCreateAsync("policy:catalog:gemini", async entry =>
        {
            entry.AbsoluteExpirationRelativeToNow = TimeSpan.FromMinutes(5);
            var onlineModels = new HashSet<string>(StringComparer.OrdinalIgnoreCase);

            try
            {
                var request = new HttpRequestMessage(HttpMethod.Get, "https://generativelanguage.googleapis.com/v1beta/openai/models");
                if (!string.IsNullOrWhiteSpace(_apiKey))
                    request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", _apiKey);

                var response = await _httpClient.SendAsync(request, cancellationToken);
                if (!response.IsSuccessStatusCode) return onlineModels;

                var json = await response.Content.ReadAsStringAsync(cancellationToken);
                using var document = JsonDocument.Parse(json);

                if (!document.RootElement.TryGetProperty("data", out var dataArray)) return onlineModels;

                foreach (var element in dataArray.EnumerateArray())
                {
                    var id = element.GetProperty("id").GetString();
                    if (!string.IsNullOrEmpty(id))
                    {
                        if (id.StartsWith("models/", StringComparison.OrdinalIgnoreCase))
                        {
                            id = id.Substring(7);
                        }

                        onlineModels.Add(id);
                    }
                }
            }
            catch { }

            return onlineModels;
        }) ?? new HashSet<string>();
    }
}
