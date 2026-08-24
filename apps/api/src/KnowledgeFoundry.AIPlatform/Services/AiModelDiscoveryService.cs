using KnowledgeFoundry.AIPlatform.Models;
using KnowledgeFoundry.Application.Abstractions.Services;
using KnowledgeFoundry.Application.Common.Models;
using KnowledgeFoundry.Domain.PromptTemplates.Enums;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using System.Net.Http.Headers;
using System.Text.Json;

namespace KnowledgeFoundry.AIPlatform.Services;

internal sealed class AiModelDiscoveryService : IAiModelDiscoveryService
{
    private readonly IConfiguration _configuration;
    private readonly IMemoryCache _cache;
    private readonly HttpClient _httpClient;
    private readonly IFreeModelVerificationService _verificationService;
    private readonly ILogger<AiModelDiscoveryService> _logger;

    public AiModelDiscoveryService(
        IConfiguration configuration,
        IMemoryCache cache,
        HttpClient httpClient,
        IFreeModelVerificationService verificationService,
        ILogger<AiModelDiscoveryService> logger)
    {
        _configuration = configuration;
        _cache = cache;
        _httpClient = httpClient;
        _verificationService = verificationService;
        _logger = logger;
    }

    public async Task<List<AiModelDto>> GetAvailableModelsAsync(CancellationToken cancellationToken = default)
    {
        // The entire finalized, verified list of DTOs is cached for 5 minutes!
        return await _cache.GetOrCreateAsync("discovery:verified-models", async entry =>
        {
            entry.AbsoluteExpirationRelativeToNow = TimeSpan.FromMinutes(5);
            var discoveredModels = new List<AiModelDto>();
            var providers = new[] { AiProvider.Groq, AiProvider.OpenRouter, AiProvider.Gemini };

            var blacklistedKeywords = new[] { "whisper", "guard", "compound", "clip", "vision", "embedding", "aqa", "veo", "lyria", "robotics", "tts" };

            foreach (var provider in providers)
            {
                var (apiKey, endpoint) = GetProviderConfig(provider);
                try
                {
                    var request = new HttpRequestMessage(HttpMethod.Get, $"{endpoint}models");
                    if (!string.IsNullOrWhiteSpace(apiKey)) request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", apiKey);

                    var response = await _httpClient.SendAsync(request, cancellationToken);
                    if (!response.IsSuccessStatusCode) continue;

                    var json = await response.Content.ReadAsStringAsync(cancellationToken);
                    using var document = JsonDocument.Parse(json);
                    if (!document.RootElement.TryGetProperty("data", out var dataArray)) continue;

                    var rawModelIds = new List<string>();
                    foreach (var element in dataArray.EnumerateArray())
                    {
                        var modelId = element.GetProperty("id").GetString();
                        if (string.IsNullOrEmpty(modelId) || blacklistedKeywords.Any(k => modelId.Contains(k, StringComparison.OrdinalIgnoreCase))) continue;
                        rawModelIds.Add(modelId);
                    }

                    foreach (var modelId in rawModelIds)
                    {
                        // This is now lightning fast because the Policies are reading from RAM!
                        var verificationResult = await _verificationService.VerifyModelAsync(provider, modelId, cancellationToken);
                        if (verificationResult == FreeModelResult.Free)
                        {
                            discoveredModels.Add(new AiModelDto((int)provider, provider.ToString(), modelId));
                        }
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Failed to discover models for provider {Provider}", provider);
                }
            }
            return discoveredModels.OrderBy(m => m.ProviderId).ThenBy(m => m.ModelId).ToList();
        }) ?? new List<AiModelDto>();
    }

    private (string? ApiKey, string Endpoint) GetProviderConfig(AiProvider provider)
    {
        var apiKey = _configuration[$"{provider}:ApiKey"];

        var endpoint = provider switch
        {
            AiProvider.Groq => "https://api.groq.com/openai/v1/",
            AiProvider.OpenRouter => "https://openrouter.ai/api/v1/",
            AiProvider.Gemini => "https://generativelanguage.googleapis.com/v1beta/openai/",
            _ => throw new NotSupportedException($"Provider {provider} not supported.")
        };

        return (apiKey, endpoint);
    }
}
