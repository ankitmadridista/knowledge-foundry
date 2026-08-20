using KnowledgeFoundry.Application.Common.Models;
using KnowledgeFoundry.Application.Common.Results;
using KnowledgeFoundry.Application.ContextPacks.Models;
using MediatR;

namespace KnowledgeFoundry.Application.ContextPacks.Queries.GetContextPacks;

public sealed record GetContextPacksQuery(
    int PageNumber = 1,
    int PageSize = 12,
    string? SearchTerm = null)
    : IRequest<Result<PagedResponse<ContextPackSummaryDto>>>;
