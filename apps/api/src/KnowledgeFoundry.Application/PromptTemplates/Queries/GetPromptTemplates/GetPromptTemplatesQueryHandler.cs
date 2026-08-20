using KnowledgeFoundry.Application.Abstractions.Persistence;
using KnowledgeFoundry.Application.Common.Models;
using KnowledgeFoundry.Application.Common.Results;
using MediatR;

namespace KnowledgeFoundry.Application.PromptTemplates.Queries.GetPromptTemplates;

public sealed class GetPromptTemplatesQueryHandler
    : IRequestHandler<GetPromptTemplatesQuery, Result<PagedResponse<PromptTemplateSummaryDto>>>
{
    private readonly IPromptTemplateRepository _repository;

    public GetPromptTemplatesQueryHandler(IPromptTemplateRepository repository)
    {
        _repository = repository;
    }

    public async Task<Result<PagedResponse<PromptTemplateSummaryDto>>> Handle(
        GetPromptTemplatesQuery request,
        CancellationToken cancellationToken)
    {
        var (templates, totalCount) = await _repository.GetPagedAsync(
            request.PageNumber,
            request.PageSize,
            request.SearchTerm,
            request.Provider,
            cancellationToken);

        var dtos = templates.Select(t => new PromptTemplateSummaryDto(
            t.Id,
            t.Identifier.Value,
            t.Name.Value,
            t.Description.Value,
            (int)t.Purpose,
            (int)t.Provider,
            t.Model.Value,
            t.Tags.Select(tag => tag.Value)
        )).ToList();

        var response = new PagedResponse<PromptTemplateSummaryDto>(
            dtos,
            totalCount,
            request.PageNumber,
            request.PageSize);

        return Result<PagedResponse<PromptTemplateSummaryDto>>.Success(response);
    }
}
