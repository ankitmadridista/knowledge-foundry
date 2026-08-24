using KnowledgeFoundry.AIPlatform.Models;
using KnowledgeFoundry.Application.Abstractions.Services;
using KnowledgeFoundry.Application.Common.Models;
using KnowledgeFoundry.Domain.PromptTemplates.Enums;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using System.Net.Http.Headers;
using System.Text.Json;

namespace KnowledgeFoundry.AIPlatform.Services;

internal sealed class AiModelDiscoveryService : IAiModelDiscoveryService
{
    private readonly IConfiguration _configuration;
    private readonly HttpClient _httpClient;
    private readonly IFreeModelVerificationService _verificationService;
    private readonly ILogger<AiModelDiscoveryService> _logger;

    public AiModelDiscoveryService(
        IConfiguration configuration,
        HttpClient httpClient,
        IFreeModelVerificationService verificationService,
        ILogger<AiModelDiscoveryService> logger)
    {
        _configuration = configuration;
        _httpClient = httpClient;
        _verificationService = verificationService;
        _logger = logger;
    }

    public async Task<List<AiModelDto>> GetAvailableModelsAsync(CancellationToken cancellationToken = default)
    {
        var discoveredModels = new List<AiModelDto>();
        var providers = new[] { AiProvider.Groq, AiProvider.OpenRouter, AiProvider.Gemini };

        // Pipeline Step 1: Filter out explicitly unsupported modalities
        var blacklistedKeywords = new[]
        {
            "whisper", "guard", "compound", "clip", "vision",
            "embedding", "aqa", "veo", "lyria", "robotics", "tts"
        };

        foreach (var provider in providers)
        {
            var (apiKey, endpoint) = GetProviderConfig(provider);

            try
            {
                var request = new HttpRequestMessage(HttpMethod.Get, $"{endpoint}models");

                if (!string.IsNullOrWhiteSpace(apiKey))
                {
                    request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", apiKey);
                }

                // Pipeline Step 2: Provider Model Discovery
                var response = await _httpClient.SendAsync(request, cancellationToken);
                if (!response.IsSuccessStatusCode) continue;

                var json = await response.Content.ReadAsStringAsync(cancellationToken);
                using var document = JsonDocument.Parse(json);

                if (!document.RootElement.TryGetProperty("data", out var dataArray)) continue;

                var rawModelIds = new List<string>();

                // Pipeline Step 3: Normalize metadata & filter unsupported
                foreach (var element in dataArray.EnumerateArray())
                {
                    var modelId = element.GetProperty("id").GetString();
                    if (string.IsNullOrEmpty(modelId)) continue;

                    bool isBlacklisted = blacklistedKeywords.Any(keyword =>
                        modelId.Contains(keyword, StringComparison.OrdinalIgnoreCase));

                    if (isBlacklisted) continue;

                    rawModelIds.Add(modelId);
                }

                // Pipeline Step 4 & 5: Provider-specific free-tier policy & Verified Models Only
                foreach (var modelId in rawModelIds)
                {
                    var verificationResult = await _verificationService.VerifyModelAsync(provider, modelId, cancellationToken);

                    if (verificationResult == FreeModelResult.Free)
                    {
                        discoveredModels.Add(new AiModelDto(
                            (int)provider,
                            provider.ToString(),
                            modelId
                        ));
                    }
                }
            }
            catch (Exception ex)
            {
                // We do not throw here. If one provider is down, we still want to return the models for the other providers.
                _logger.LogError(ex, "Failed to discover models for provider {Provider}", provider);
            }
        }

        // Pipeline Step 6: Frontend DTO
        return discoveredModels.OrderBy(m => m.ProviderId).ThenBy(m => m.ModelId).ToList();
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
