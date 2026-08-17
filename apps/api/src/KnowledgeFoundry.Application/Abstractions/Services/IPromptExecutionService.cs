using KnowledgeFoundry.Application.PromptTemplates.Queries.GetActivePromptPayload;
using KnowledgeFoundry.Domain.PromptTemplates.Enums;

namespace KnowledgeFoundry.Application.Abstractions.Services;

public interface IPromptExecutionService
{
    Task<string> ExecuteAsync(
        IEnumerable<MessagePayloadDto> messages,
        AiProvider provider,
        string model,
        CancellationToken cancellationToken = default);
}
