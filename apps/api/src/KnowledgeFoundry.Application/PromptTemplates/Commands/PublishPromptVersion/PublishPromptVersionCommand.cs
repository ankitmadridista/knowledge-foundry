using KnowledgeFoundry.Application.Common.Results;
using MediatR;

namespace KnowledgeFoundry.Application.PromptTemplates.Commands.PublishPromptVersion;

public sealed record PublishPromptVersionCommand(
    Guid PromptTemplateId,
    int VersionNumber) : IRequest<Result<bool>>;
