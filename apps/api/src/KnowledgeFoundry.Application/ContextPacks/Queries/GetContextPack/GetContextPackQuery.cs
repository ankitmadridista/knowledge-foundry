using KnowledgeFoundry.Application.Common.Results;
using KnowledgeFoundry.Application.ContextPacks.Models;
using MediatR;

namespace KnowledgeFoundry.Application.ContextPacks.Queries.GetContextPack;

public sealed record GetContextPackQuery(Guid Id) : IRequest<Result<ContextPackDto>>;
