using KnowledgeFoundry.Application.Common.Models;
using KnowledgeFoundry.Application.Common.Results;
using MediatR;

namespace KnowledgeFoundry.Application.PromptTemplates.Queries.GetPromptTemplates;

public record PromptTemplateSummaryDto(
    Guid Id,
    string Identifier,
    string Name,
    string Description,
    int Purpose,
    int Provider,
    string Model,
    IEnumerable<string> Tags);

public sealed record GetPromptTemplatesQuery(int PageNumber = 1, int PageSize = 12)
    : IRequest<Result<PagedResponse
        <PromptTemplateSummaryDto>>>;
