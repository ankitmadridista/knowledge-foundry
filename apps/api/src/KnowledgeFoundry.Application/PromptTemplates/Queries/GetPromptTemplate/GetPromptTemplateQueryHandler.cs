using KnowledgeFoundry.Application.Abstractions.Persistence;
using KnowledgeFoundry.Application.Common.Errors;
using KnowledgeFoundry.Application.Common.Results;
using KnowledgeFoundry.Application.DomainModels;
using MediatR;

namespace KnowledgeFoundry.Application.PromptTemplates.Queries.GetPromptTemplate;

public sealed class GetPromptTemplateQueryHandler
    : IRequestHandler<GetPromptTemplateQuery, Result<PromptTemplateDtos>>
{
    private readonly IPromptTemplateRepository _repository;

    public GetPromptTemplateQueryHandler(IPromptTemplateRepository repository)
    {
        _repository = repository;
    }

    public async Task<Result<PromptTemplateDtos>> Handle(
        GetPromptTemplateQuery request,
        CancellationToken cancellationToken)
    {
        var template = await _repository.GetByIdAsync(request.Id, cancellationToken);

        if (template is null)
        {
            return Result<PromptTemplateDtos>.Failure(PromptTemplateErrors.NotFound);
        }

        // Map the Domain Entity to the Application DTO
        var dto = new PromptTemplateDtos(
            template.Id,
            template.Identifier.Value,
            template.Name.Value,
            template.Description.Value,
            template.Purpose,
            template.Provider,
            template.Model,
            template.Tags.Select(t => t.Value).ToList().AsReadOnly(),
            Versions: template.Versions.Select(v => new PromptVersionDto(
                v.VersionNumber.Value,
                v.Status.ToString(), // Converts Enum to string like "Draft"
                (int)v.Capability,
                v.CreatedAt
            )).ToList());

        return Result<PromptTemplateDtos>.Success(dto);
    }
}
