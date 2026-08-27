using KnowledgeFoundry.AIPlatform.Models;
using KnowledgeFoundry.Application.Abstractions.Persistence;
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
    private readonly ICorpSettingsRepository _corpSettingsRepository;
    private readonly ILogger<AiModelDiscoveryService> _logger;

    public AiModelDiscoveryService(
        IConfiguration configuration,
        IMemoryCache cache,
        HttpClient httpClient,
        IFreeModelVerificationService verificationService,
        ICorpSettingsRepository corpSettingsRepository,
        ILogger<AiModelDiscoveryService> logger)
    {
        _configuration = configuration;
        _cache = cache;
        _httpClient = httpClient;
        _verificationService = verificationService;
        _corpSettingsRepository = corpSettingsRepository;
        _logger = logger;
    }

    public async Task<List<AiModelDto>> GetAvailableModelsAsync(CancellationToken cancellationToken = default)
    {
        // 1. Fetch the feature toggle from the Database
        var settings = await _corpSettingsRepository.GetSettingsAsync(cancellationToken);

        // 2. Fallback Mode (Discovery is OFF)
        if (!settings.EnableDynamicModelDiscovery)
        {
            _logger.LogInformation("⚡ [Discovery Mode: OFFLINE] Dynamic discovery is disabled. Loading hardcoded verified models from configuration.");
            return GetHardcodedModelsFromConfig();
        }

        // 3. Dynamic Mode (Discovery is ON) - Using our existing Caching Logic
        const string cacheKey = "discovery:verified-models";

        // Check outer discovery cache
        if (_cache.TryGetValue<List<AiModelDto>>(cacheKey, out var cachedModels) && cachedModels != null)
        {
            _logger.LogInformation("🚀 [Discovery Cache HIT] Returning {Count} verified models directly from RAM (Zero HTTP calls).", cachedModels.Count);
            return cachedModels;
        }

        _logger.LogInformation("🔍 [Discovery Cache MISS] Fetching catalogs and verifying models across all providers...");

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
                    if (string.IsNullOrWhiteSpace(modelId)) continue;

                    if (provider == AiProvider.Gemini && modelId.StartsWith("models/", StringComparison.OrdinalIgnoreCase))
                    {
                        modelId = modelId.Substring(7);
                    }

                    if (blacklistedKeywords.Any(k => modelId.Contains(k, StringComparison.OrdinalIgnoreCase))) continue;
                    rawModelIds.Add(modelId);
                }

                foreach (var modelId in rawModelIds)
                {
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

        var finalizedList = discoveredModels.OrderBy(m => m.ProviderId).ThenBy(m => m.ModelId).ToList();

        _cache.Set(cacheKey, finalizedList, TimeSpan.FromMinutes(5));

        return finalizedList;
    }

    /// <summary>
    /// Bypasses HTTP entirely and reads the AuthorizedFreeModels directly from appsettings.json
    /// </summary>
    private List<AiModelDto> GetHardcodedModelsFromConfig()
    {
        var offlineModels = new List<AiModelDto>();
        var providers = new[] { AiProvider.Groq, AiProvider.OpenRouter, AiProvider.Gemini };

        foreach (var provider in providers)
        {
            // Read the string array directly from configuration
            var authorizedModels = _configuration.GetSection($"{provider}:AuthorizedFreeModels").Get<string[]>() ?? Array.Empty<string>();

            foreach (var modelId in authorizedModels)
            {
                offlineModels.Add(new AiModelDto((int)provider, provider.ToString(), modelId));
            }
        }

        return offlineModels.OrderBy(m => m.ProviderId).ThenBy(m => m.ModelId).ToList();
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
