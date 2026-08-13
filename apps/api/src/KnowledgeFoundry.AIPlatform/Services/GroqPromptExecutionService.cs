using System.ClientModel;
using KnowledgeFoundry.Application.Abstractions.Services;
using KnowledgeFoundry.Application.PromptTemplates.Queries.GetActivePromptPayload;
using Microsoft.Extensions.Configuration;
using OpenAI;
using OpenAI.Chat;

namespace KnowledgeFoundry.AIPlatform.Services;

internal sealed class GroqPromptExecutionService : IPromptExecutionService
{
    private readonly string _apiKey;
    private readonly string _model;

    public GroqPromptExecutionService(IConfiguration configuration)
    {
        // Fetch values from appsettings.Development.json
        _apiKey = configuration["Groq:ApiKey"]
            ?? throw new InvalidOperationException("Groq:ApiKey is missing in configuration.");

        _model = configuration["Groq:Model"]
            ?? "llama-3.3-70b-versatile";
    }

    public async Task<string> ExecuteAsync(
        IEnumerable<MessagePayloadDto> messages,
        CancellationToken cancellationToken = default)
    {
        // 1. Initialize the official OpenAI client, but point it to Groq's endpoint
        var options = new OpenAIClientOptions
        {
            Endpoint = new Uri("https://api.groq.com/openai/v1/")
        };

        var chatClient = new ChatClient(_model, new ApiKeyCredential(_apiKey), options);

        // 2. Map your Clean Architecture DTOs to OpenAI's official ChatMessage types
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

        // 3. Fire the request to Groq's lightning-fast hardware
        var completion = await chatClient.CompleteChatAsync(openAiMessages, cancellationToken: cancellationToken);

        // 4. Extract and return the generated text
        return completion.Value.Content[0].Text;
    }
}
