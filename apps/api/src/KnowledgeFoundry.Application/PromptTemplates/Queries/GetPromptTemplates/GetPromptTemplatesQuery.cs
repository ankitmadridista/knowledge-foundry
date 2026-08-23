using KnowledgeFoundry.Application.Common.Models;
using KnowledgeFoundry.Application.Common.Results;
using KnowledgeFoundry.Application.DomainModels;
using MediatR;

namespace KnowledgeFoundry.Application.PromptTemplates.Queries.GetPromptTemplates;

public sealed record GetPromptTemplatesQuery(
    int PageNumber = 1,
    int PageSize = 12,
    string? SearchTerm = null,
    int? Provider = null)
    : IRequest<Result<PagedResponse<PromptTemplateSummaryDto>>>;
