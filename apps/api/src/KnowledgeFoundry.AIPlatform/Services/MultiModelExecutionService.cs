using System.ClientModel;
using KnowledgeFoundry.Application.Abstractions.Services;
using KnowledgeFoundry.Application.PromptTemplates.Queries.GetActivePromptPayload;
using KnowledgeFoundry.Domain.PromptTemplates.Enums;
using Microsoft.Extensions.Configuration;
using OpenAI;
using OpenAI.Chat;

namespace KnowledgeFoundry.AIPlatform.Services;

internal sealed class MultiModelExecutionService : IPromptExecutionService
{
    private readonly IConfiguration _configuration;

    public MultiModelExecutionService(IConfiguration configuration)
    {
        _configuration = configuration;
    }

    public async Task<string> ExecuteAsync(
        IEnumerable<MessagePayloadDto> messages,
        AiProvider provider,
        string model,
        CancellationToken cancellationToken = default)
    {
        // 1. Resolve API Key and Endpoint based on Provider
        var (apiKey, endpoint) = GetProviderConfig(provider);

        if (string.IsNullOrWhiteSpace(apiKey))
        {
            throw new InvalidOperationException($"API Key for provider '{provider}' is missing in configuration.");
        }

        // 2. Initialize the OpenAI client pointing to the dynamically selected provider
        var options = new OpenAIClientOptions
        {
            Endpoint = new Uri(endpoint)
        };

        var chatClient = new ChatClient(model, new ApiKeyCredential(apiKey), options);

        // 3. Map Clean Architecture DTOs to OpenAI's official types
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

        // 4. Fire the request to the dynamically chosen provider
        var completion = await chatClient.CompleteChatAsync(openAiMessages, cancellationToken: cancellationToken);

        // 5. Extract and return the generated text
        return completion.Value.Content[0].Text;
    }

    private (string? ApiKey, string Endpoint) GetProviderConfig(AiProvider provider)
    {
        // Dynamically fetch the API key using string interpolation (e.g., "Groq:ApiKey")
        var apiKey = _configuration[$"{provider}:ApiKey"];

        // Map the correct OpenAI-compatible base URL for the requested provider
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
