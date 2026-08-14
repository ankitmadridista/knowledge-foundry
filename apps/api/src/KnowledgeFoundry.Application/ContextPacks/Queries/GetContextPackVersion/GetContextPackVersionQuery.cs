using KnowledgeFoundry.Application.Common.Results;
using KnowledgeFoundry.Application.ContextPacks.Models;
using MediatR;

namespace KnowledgeFoundry.Application.ContextPacks.Queries.GetContextPackVersion;

public sealed record GetContextPackVersionQuery(Guid ContextPackId, int VersionNumber)
    : IRequest<Result<ContextPackVersionDetailsDto>>;
