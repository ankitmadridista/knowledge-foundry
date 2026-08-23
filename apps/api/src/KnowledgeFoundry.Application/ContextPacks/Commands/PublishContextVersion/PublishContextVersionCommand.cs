using KnowledgeFoundry.Application.Common.Results;
using MediatR;

namespace KnowledgeFoundry.Application.ContextPacks.Commands.PublishContextVersion
{
    public sealed record PublishContextVersionCommand(
        Guid ContextPackId,
        int VersionNumber) : IRequest<Result<bool>>;
}
