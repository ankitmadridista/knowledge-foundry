using KnowledgeFoundry.Application.Abstractions.Services;
using KnowledgeFoundry.Domain.PromptTemplates.Enums;
using KnowledgeFoundry.AIPlatform.Exceptions;
using KnowledgeFoundry.AIPlatform.Models;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using OpenAI;
using OpenAI.Embeddings;
using System.ClientModel;

namespace KnowledgeFoundry.AIPlatform.Services;

internal sealed class MultiModelEmbeddingService : IEmbeddingService
{
    private readonly IConfiguration _configuration;
    private readonly IFreeModelVerificationService _verificationService;
    private readonly ILogger<MultiModelEmbeddingService> _logger;

    public MultiModelEmbeddingService(
        IConfiguration configuration,
        IFreeModelVerificationService verificationService,
        ILogger<MultiModelEmbeddingService> logger)
    {
        _configuration = configuration;
        _verificationService = verificationService;
        _logger = logger;
    }

    public async Task<EmbeddingTelemetry> GenerateEmbeddingAsync(
        string text,
        AiProvider provider,
        string model,
        CancellationToken cancellationToken = default)
    {
        // =====================================================================
        // SECURITY BOUNDARY: Verify the embedding model is free-tier
        // =====================================================================
        var verificationResult = await _verificationService.VerifyModelAsync(provider, model, cancellationToken);

        if (verificationResult != FreeModelResult.Free)
        {
            _logger.LogCritical("SECURITY ALERT: Embedding blocked. Attempted to execute unverified/paid embedding model '{Model}' via '{Provider}'.", model, provider);
            throw new AiAuthorizationException($"The requested embedding model '{model}' is not authorized for free-tier execution.");
        }
        // =====================================================================

        var (apiKey, endpoint) = GetProviderConfig(provider);

        if (string.IsNullOrWhiteSpace(apiKey))
        {
            throw new InvalidOperationException($"API Key for provider '{provider}' is missing in configuration.");
        }

        var options = new OpenAIClientOptions { Endpoint = new Uri(endpoint) };
        var embeddingClient = new EmbeddingClient(model, new ApiKeyCredential(apiKey), options);

        try
        {
            var sw = System.Diagnostics.Stopwatch.StartNew();

            // Generate the vector array
            var response = await embeddingClient.GenerateEmbeddingsAsync(
                new[] { text },
                cancellationToken: cancellationToken);

            sw.Stop();

            // Extract the float[] and the tokens used
            var vectorArray = response.Value[0].ToFloats().ToArray();
            var tokensUsed = response.Value.Usage?.TotalTokenCount ?? 0;

            // pgvector strictly expects exactly 768 dimensions based on our EF Core configuration.
            if (vectorArray.Length != 768)
            {
                throw new InvalidOperationException($"Dimension mismatch! The model '{model}' returned {vectorArray.Length} dimensions, but the database expects exactly 768. Please select a 768-dimension free model like 'text-embedding-004' (Gemini) or 'nomic-ai/nomic-embed-text' (OpenRouter).");
            }

            return new EmbeddingTelemetry(vectorArray, tokensUsed, sw.ElapsedMilliseconds);
        }
        catch (ClientResultException ex)
        {
            _logger.LogError("[CRITICAL AI ERROR] Embedding Failed. Status: {Status} | Provider: {Provider} | Details: {Error}", ex.Status, provider, ex.Message);
            throw new Exception("The AI provider rejected the embedding request. " + ex.Message);
        }
    }

    private (string? ApiKey, string Endpoint) GetProviderConfig(AiProvider provider)
    {
        var apiKey = _configuration[$"{provider}:ApiKey"];

        var endpoint = provider switch
        {
            AiProvider.Groq => "https://api.groq.com/openai/v1/",
            AiProvider.OpenRouter => "https://openrouter.ai/api/v1/",
            AiProvider.Gemini => "https://generativelanguage.googleapis.com/v1beta/openai/",
            _ => throw new NotSupportedException($"The provider '{provider}' is not supported.")
        };

        return (apiKey, endpoint);
    }
}
