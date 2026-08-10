using KnowledgeFoundry.Application.Abstractions.Services;
using KnowledgeFoundry.Application.PromptTemplates.Queries.GetActivePromptPayload;

namespace KnowledgeFoundry.Infrastructure.Services;

internal sealed class MockPromptExecutionService : IPromptExecutionService
{
    public async Task<string> ExecuteAsync(
        IEnumerable<MessagePayloadDto> messages,
        CancellationToken cancellationToken = default)
    {
        // Simulate network latency so it "feels" like a real AI call
        await Task.Delay(1500, cancellationToken);

        var systemMessage = messages.FirstOrDefault(m => m.Role == "system" || m.Role == "developer")?.Content ?? "None";
        var userMessage = messages.LastOrDefault(m => m.Role == "user")?.Content ?? "None";

        // Return a fake AI response that proves we received the variables correctly
        return $@"🚀 [MOCK AI RESPONSE]
            I have processed your prompt!
            System Context Provided: '{systemMessage}'
            User Request: '{userMessage}'

            I am a mock service, but your Clean Architecture pipeline is working perfectly!";
    }
}
