using KnowledgeFoundry.Application.Common.Results;
using MediatR;

namespace KnowledgeFoundry.Application.PromptTemplates.Queries.GetPromptTemplates;

public record PromptTemplateSummaryDto(
    Guid Id,
    string Identifier,
    string Name,
    string Description,
    int Purpose,
    IEnumerable<string> Tags);

public sealed record GetPromptTemplatesQuery()
    : IRequest<Result<IReadOnlyList<PromptTemplateSummaryDto>>>;
