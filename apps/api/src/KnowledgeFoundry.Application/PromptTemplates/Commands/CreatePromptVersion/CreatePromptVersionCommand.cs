using KnowledgeFoundry.Application.Common.Results;
using KnowledgeFoundry.Domain.PromptTemplates.Enums;
using MediatR;

namespace KnowledgeFoundry.Application.PromptTemplates.Commands.CreatePromptVersion;

public record PromptMessageDto(
    PromptMessageRole Role,
    string Content,
    int Order);

public sealed record CreatePromptVersionCommand(
    Guid PromptTemplateId,
    IReadOnlyCollection<PromptMessageDto> Messages,
    PromptCapability Capability
) : IRequest<Result<int>>; // We return int (the Version Number)
