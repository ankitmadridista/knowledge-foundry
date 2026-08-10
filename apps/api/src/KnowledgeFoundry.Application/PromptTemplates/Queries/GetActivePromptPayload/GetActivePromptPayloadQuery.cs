using KnowledgeFoundry.Application.Common.Results;
using MediatR;

namespace KnowledgeFoundry.Application.PromptTemplates.Queries.GetActivePromptPayload;

public record MessagePayloadDto(string Role, string Content);

public record PromptPayloadDto(
    string Identifier,
    IEnumerable<MessagePayloadDto> Messages,
    IEnumerable<string> Variables,
    string Capability);

public sealed record GetActivePromptPayloadQuery(string Identifier)
    : IRequest<Result<PromptPayloadDto>>;
