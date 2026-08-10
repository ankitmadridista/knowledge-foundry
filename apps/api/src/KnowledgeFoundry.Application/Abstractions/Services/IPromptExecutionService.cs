using KnowledgeFoundry.Application.PromptTemplates.Queries.GetActivePromptPayload;

namespace KnowledgeFoundry.Application.Abstractions.Services;

public interface IPromptExecutionService
{
    Task<string> ExecuteAsync(
        IEnumerable<MessagePayloadDto> messages,
        CancellationToken cancellationToken = default);
}
