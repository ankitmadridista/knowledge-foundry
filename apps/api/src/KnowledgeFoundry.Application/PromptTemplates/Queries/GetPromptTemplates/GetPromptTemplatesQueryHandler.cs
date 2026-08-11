using KnowledgeFoundry.Application.Abstractions.Persistence;
using KnowledgeFoundry.Application.Common.Results;
using KnowledgeFoundry.Application.PromptTemplates.Queries.GetPromptTemplate;
using MediatR;

namespace KnowledgeFoundry.Application.PromptTemplates.Queries.GetPromptTemplates;

public sealed class GetPromptTemplatesQueryHandler
    : IRequestHandler<GetPromptTemplatesQuery, Result<IReadOnlyList<PromptTemplateSummaryDto>>>
{
    private readonly IPromptTemplateRepository _repository;

    public GetPromptTemplatesQueryHandler(IPromptTemplateRepository repository)
    {
        _repository = repository;
    }

    public async Task<Result<IReadOnlyList<PromptTemplateSummaryDto>>> Handle(
        GetPromptTemplatesQuery request,
        CancellationToken cancellationToken)
    {
        var templates = await _repository.GetAllAsync(cancellationToken);

        var dtos = templates.Select(t => new PromptTemplateSummaryDto(
            t.Id,
            t.Identifier.Value,
            t.Name.Value,
            t.Description.Value,
            (int)t.Purpose,
            t.Tags.Select(tag => tag.Value)
        )).ToList();

        return Result<IReadOnlyList<PromptTemplateSummaryDto>>.Success(dtos);
    }
}
