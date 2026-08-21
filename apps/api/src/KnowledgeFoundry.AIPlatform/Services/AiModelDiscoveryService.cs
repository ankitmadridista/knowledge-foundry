using KnowledgeFoundry.Application.Abstractions.Services;
using KnowledgeFoundry.Application.Common.Models;
using KnowledgeFoundry.Domain.PromptTemplates.Enums;
using Microsoft.Extensions.Configuration;
using System.Net.Http.Headers;
using System.Text.Json;

namespace KnowledgeFoundry.AIPlatform.Services;

internal sealed class AiModelDiscoveryService : IAiModelDiscoveryService
{
    private readonly IConfiguration _configuration;
    private readonly HttpClient _httpClient;

    public AiModelDiscoveryService(IConfiguration configuration, HttpClient httpClient)
    {
        _configuration = configuration;
        _httpClient = httpClient;
    }

    public async Task<List<AiModelDto>> GetAvailableModelsAsync(CancellationToken cancellationToken = default)
    {
        var availableModels = new List<AiModelDto>();
        var providers = new[] { AiProvider.Groq, AiProvider.OpenRouter, AiProvider.Gemini };

        // Blocklist to filter out non-chat models across all providers
        var blacklistedKeywords = new[]
        {
            "whisper",   // Audio transcription
            "guard",     // Prompt safety moderation
            "compound",  // Internal routing models
            "clip",      // Image embeddings
            "vision",    // Pure vision models
            "embedding", // Text embeddings
            "aqa"        // Google's Attributed Question Answering
        };

        foreach (var provider in providers)
        {
            var (apiKey, endpoint) = GetProviderConfig(provider);

            try
            {
                var request = new HttpRequestMessage(HttpMethod.Get, $"{endpoint}models");

                // 1. FIX: Only add the header if the key exists. 
                // This allows OpenRouter to fetch its public free model list even if you haven't set a key yet!
                if (!string.IsNullOrWhiteSpace(apiKey))
                {
                    request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", apiKey);
                }

                var response = await _httpClient.SendAsync(request, cancellationToken);

                if (!response.IsSuccessStatusCode) continue;

                var json = await response.Content.ReadAsStringAsync(cancellationToken);
                using var document = JsonDocument.Parse(json);

                if (document.RootElement.TryGetProperty("data", out var dataArray))
                {
                    foreach (var element in dataArray.EnumerateArray())
                    {
                        var modelId = element.GetProperty("id").GetString();

                        if (string.IsNullOrEmpty(modelId)) continue;

                        bool isBlacklisted = blacklistedKeywords.Any(keyword =>
                            modelId.Contains(keyword, StringComparison.OrdinalIgnoreCase));

                        if (isBlacklisted) continue;

                        // OpenRouter specific logic: ONLY allow free models
                        if (provider == AiProvider.OpenRouter)
                        {
                            if (element.TryGetProperty("pricing", out var pricing))
                            {
                                // 2. FIX: Safely use TryGetProperty instead of GetProperty.
                                // This prevents the entire loop from crashing if an OpenRouter image model is missing the "prompt" price.
                                if (pricing.TryGetProperty("prompt", out var promptElement))
                                {
                                    // Handle both string "0" and integer 0 formats just to be safe
                                    var promptPrice = promptElement.ValueKind == JsonValueKind.String
                                        ? promptElement.GetString()
                                        : promptElement.GetRawText();

                                    if (promptPrice != "0" && promptPrice != "0.0") continue;
                                }
                                else
                                {
                                    continue; // Skip models that don't have a prompt price
                                }
                            }
                        }

                        availableModels.Add(new AiModelDto(
                            (int)provider,
                            provider.ToString(),
                            modelId
                        ));
                    }
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Failed to fetch {provider} models: {ex.Message}");
            }
        }

        return availableModels.OrderBy(m => m.ProviderId).ThenBy(m => m.ModelId).ToList();
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
