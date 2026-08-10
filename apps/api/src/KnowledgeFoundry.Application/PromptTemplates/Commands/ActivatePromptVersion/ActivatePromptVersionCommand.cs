using KnowledgeFoundry.Application.Common.Results;
using MediatR;

namespace KnowledgeFoundry.Application.PromptTemplates.Commands.ActivatePromptVersion;

public sealed record ActivatePromptVersionCommand(
    Guid PromptTemplateId,
    int VersionNumber) : IRequest<Result<bool>>;
