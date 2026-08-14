using KnowledgeFoundry.Application.Common.Results;
using MediatR;

namespace KnowledgeFoundry.Application.ContextPacks.Commands.ActivateContextVersion;

public sealed record ActivateContextVersionCommand(
    Guid ContextPackId,
    int VersionNumber) : IRequest<Result<bool>>;
