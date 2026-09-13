using KnowledgeFoundry.Application.DomainModels;
using KnowledgeFoundry.Domain.PromptTemplates.Enums;

namespace KnowledgeFoundry.Application.Abstractions.Services;

public record ExecutionTelemetry(string Response, int TokensUsed, long ExecutionTimeMs);

public interface IPromptExecutionService
{
    Task<ExecutionTelemetry> ExecuteAsync(
        IEnumerable<MessagePayloadDto> messages,
        AiProvider provider,
        string model,
        CancellationToken cancellationToken = default);
}
