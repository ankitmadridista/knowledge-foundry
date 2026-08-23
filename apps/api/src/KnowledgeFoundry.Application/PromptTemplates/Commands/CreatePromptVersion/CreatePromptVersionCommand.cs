using KnowledgeFoundry.Application.Common.Results;
using KnowledgeFoundry.Application.DomainModels;
using KnowledgeFoundry.Domain.PromptTemplates.Enums;
using MediatR;

namespace KnowledgeFoundry.Application.PromptTemplates.Commands.CreatePromptVersion;

public sealed record CreatePromptVersionCommand(
        Guid PromptTemplateId,
        IReadOnlyCollection<PromptMessageDto> Messages,
        PromptCapability Capability
    ) : IRequest<Result<int>>;
