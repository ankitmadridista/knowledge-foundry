using KnowledgeFoundry.Application.Abstractions.Services;
using KnowledgeFoundry.Application.DomainModels;
using KnowledgeFoundry.Domain.PromptTemplates.Enums;
using KnowledgeFoundry.AIPlatform.Exceptions;
using KnowledgeFoundry.AIPlatform.Models;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using OpenAI;
using OpenAI.Chat;
using System.ClientModel;

namespace KnowledgeFoundry.AIPlatform.Services;

internal sealed class MultiModelExecutionService : IPromptExecutionService
{
    private readonly IConfiguration _configuration;
    private readonly IFreeModelVerificationService _verificationService;
    private readonly ILogger<MultiModelExecutionService> _logger;

    public MultiModelExecutionService(
        IConfiguration configuration,
        IFreeModelVerificationService verificationService,
        ILogger<MultiModelExecutionService> logger)
    {
        _configuration = configuration;
        _verificationService = verificationService;
        _logger = logger;
    }

    public async Task<ExecutionTelemetry> ExecuteAsync(
        IEnumerable<MessagePayloadDto> messages,
        AiProvider provider,
        string model,
        CancellationToken cancellationToken = default)
    {
        // =====================================================================
        // SECURITY BOUNDARY: ZERO-TRUST EXECUTION GATE
        // We do NOT trust the UI's model string. We mathematically verify it.
        // =====================================================================
        var verificationResult = await _verificationService.VerifyModelAsync(provider, model, cancellationToken);

        if (verificationResult != FreeModelResult.Free)
        {
            _logger.LogCritical("SECURITY ALERT: Execution blocked. Attempted to execute unverified/paid model '{Model}' via '{Provider}'. Status: {Result}", model, provider, verificationResult);

            throw new AiAuthorizationException($"The requested AI model '{model}' is not currently authorized for free-tier execution. (Status: {verificationResult})");
        }
        // =====================================================================

        var (apiKey, endpoint) = GetProviderConfig(provider);

        if (string.IsNullOrWhiteSpace(apiKey))
        {
            throw new InvalidOperationException($"API Key for provider '{provider}' is missing in configuration.");
        }

        var options = new OpenAIClientOptions
        {
            Endpoint = new Uri(endpoint)
        };

        var chatClient = new ChatClient(model, new ApiKeyCredential(apiKey), options);

        var openAiMessages = new List<ChatMessage>();

        foreach (var msg in messages)
        {
            openAiMessages.Add(msg.Role.ToLowerInvariant() switch
            {
                "system" or "developer" => new SystemChatMessage(msg.Content),
                "assistant" => new AssistantChatMessage(msg.Content),
                _ => new UserChatMessage(msg.Content)
            });
        }

        try
        {
            var sw = System.Diagnostics.Stopwatch.StartNew();
            var completion = await chatClient.CompleteChatAsync(openAiMessages, cancellationToken: cancellationToken);
            sw.Stop();

            var responseText = completion.Value.Content[0].Text;
            var tokensUsed = completion.Value.Usage?.TotalTokenCount ?? 0;

            return new ExecutionTelemetry(responseText, tokensUsed, sw.ElapsedMilliseconds);
        }
        catch (ClientResultException ex)
        {
            var rawResponse = ex.GetRawResponse();
            var technicalError = rawResponse?.Content?.ToString() ?? ex.Message;

            _logger.LogError("[CRITICAL AI ERROR] Status: {Status} | Provider: {Provider} | Details: {TechnicalError}", ex.Status, provider, technicalError);

            var uiMessage = GetUserFriendlyErrorMessage(ex.Status);
            throw new Exception(uiMessage);
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

    private static string GetUserFriendlyErrorMessage(int httpStatusCode)
    {
        return httpStatusCode switch
        {
            400 => "The prompt is too large or contains unsupported content. Please shorten the text and try again.",
            401 or 403 => "The AI provider rejected the request due to authorization or safety policies. Please contact support.",
            402 => "Our AI services are currently out of credits. Please notify the administrator.",
            404 => "The selected AI model is currently unavailable or offline. Please select a different model and try again.",
            429 => "The AI network is currently experiencing high traffic. Please wait a few seconds and try again.",
            >= 500 => "The AI provider is experiencing temporary downtime. Please try again later.",
            _ => "An unexpected error occurred while communicating with the AI. Please try again."
        };
    }
}
