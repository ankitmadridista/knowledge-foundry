using KnowledgeFoundry.Application.Abstractions.Services;
using KnowledgeFoundry.Application.PromptTemplates.Queries.GetActivePromptPayload;
using KnowledgeFoundry.Domain.PromptTemplates.Enums;
using Microsoft.Extensions.Configuration;
using OpenAI;
using OpenAI.Chat;
using System.ClientModel;

namespace KnowledgeFoundry.AIPlatform.Services;

internal sealed class MultiModelExecutionService : IPromptExecutionService
{
    private readonly IConfiguration _configuration;

    public MultiModelExecutionService(IConfiguration configuration)
    {
        _configuration = configuration;
    }

    public async Task<ExecutionTelemetry> ExecuteAsync(
        IEnumerable<MessagePayloadDto> messages,
        AiProvider provider,
        string model,
        CancellationToken cancellationToken = default)
    {
        var (apiKey, endpoint) = GetProviderConfig(provider);

        if (string.IsNullOrWhiteSpace(apiKey))
        {
            throw new InvalidOperationException($"API Key for provider '{provider}' is missing in configuration.");
        }

        // 1. Pure, native OpenAI Options. No hacks needed!
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
            // 1. Extract the technical details for backend logging
            var rawResponse = ex.GetRawResponse();
            var technicalError = rawResponse?.Content?.ToString() ?? ex.Message;

            // LOG THIS TO YOUR CONSOLE OR SEQ/DATADOG (Not the UI)
            Console.WriteLine($"[CRITICAL AI ERROR] Status: {ex.Status} | Provider: {provider} | Details: {technicalError}");

            // 2. Generate the safe, user-friendly UI message
            var uiMessage = GetUserFriendlyErrorMessage(ex.Status);

            // 3. Send ONLY the friendly message back to the Application Layer / Frontend
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
            // 400 Bad Request (Usually Context Length exceeded or invalid payload)
            400 => "The prompt is too large or contains unsupported content. Please shorten the text and try again.",

            // 401 / 403 (Bad API keys, Geo-blocking, Safety filters)
            401 or 403 => "The AI provider rejected the request due to authorization or safety policies. Please contact support.",

            // 402 Payment Required (OpenRouter or Groq out of credits)
            402 => "Our AI services are currently out of credits. Please notify the administrator.",

            // 404 Not Found (Model deprecated, renamed, or doesn't exist)
            404 => "The selected AI model is currently unavailable or offline. Please select a different model and try again.",

            // 429 Too Many Requests (Rate limits)
            429 => "The AI network is currently experiencing high traffic. Please wait a few seconds and try again.",

            // 500+ (Provider servers are down)
            >= 500 => "The AI provider is experiencing temporary downtime. Please try again later.",

            // Fallback
            _ => "An unexpected error occurred while communicating with the AI. Please try again."
        };
    }
}
