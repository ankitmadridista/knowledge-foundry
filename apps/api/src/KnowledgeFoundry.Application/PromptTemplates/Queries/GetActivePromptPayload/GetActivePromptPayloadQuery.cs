using KnowledgeFoundry.Application.Common.Results;
using KnowledgeFoundry.Domain.PromptTemplates.Enums;
using MediatR;

namespace KnowledgeFoundry.Application.PromptTemplates.Queries.GetActivePromptPayload;

public record MessagePayloadDto(string Role, string Content);

public record PromptPayloadDto(
    string Identifier,
    IEnumerable<MessagePayloadDto> Messages,
    IEnumerable<string> Variables,
    string Capability,
    int versionNumber,
    AiProvider Provider,
    string Model);

public sealed record GetActivePromptPayloadQuery(string Identifier)
    : IRequest<Result<PromptPayloadDto>>;
