using KnowledgeFoundry.Application.Common.Results;
using KnowledgeFoundry.Application.ContextPacks.Models;
using MediatR;

namespace KnowledgeFoundry.Application.ContextPacks.Queries.GetContextPacks;

public sealed record GetContextPacksQuery : IRequest<Result<IReadOnlyList<ContextPackSummaryDto>>>;
