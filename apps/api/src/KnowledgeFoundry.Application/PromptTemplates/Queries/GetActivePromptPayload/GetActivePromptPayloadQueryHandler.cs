using KnowledgeFoundry.Application.Abstractions.Persistence;
using KnowledgeFoundry.Application.Common.Errors;
using KnowledgeFoundry.Application.Common.Results;
using KnowledgeFoundry.Domain.PromptTemplates.Enums;
using MediatR;

namespace KnowledgeFoundry.Application.PromptTemplates.Queries.GetActivePromptPayload;

public sealed class GetActivePromptPayloadQueryHandler
    : IRequestHandler<GetActivePromptPayloadQuery, Result<PromptPayloadDto>>
{
    private readonly IPromptTemplateRepository _repository;

    public GetActivePromptPayloadQueryHandler(IPromptTemplateRepository repository)
    {
        _repository = repository;
    }

    public async Task<Result<PromptPayloadDto>> Handle(
        GetActivePromptPayloadQuery request,
        CancellationToken cancellationToken)
    {
        var template = await _repository.GetByIdentifierAsync(request.Identifier, cancellationToken);

        if (template is null)
        {
            return Result<PromptPayloadDto>.Failure(PromptTemplateErrors.NotFound);
        }

        // Find the currently active version
        var activeVersion = template.Versions.SingleOrDefault(v => v.Status == PromptStatus.Active);

        if (activeVersion is null)
        {
            // If there's no active version, the prompt isn't ready for production
            return Result<PromptPayloadDto>.Failure(new Error("PromptTemplate.NoActiveVersion", "No active version found for this prompt."));
        }

        // Map it beautifully into a payload ready for an LLM
        var messages = activeVersion.Messages
            .OrderBy(m => m.Order)
            .Select(m => new MessagePayloadDto(
                m.Role.ToString().ToLowerInvariant(), // "System", "User" -> "system", "user"
                m.Content))
            .ToList();

        // Map the variables!
        var variables = activeVersion.Variables
            .Select(v => v.Name)
            .ToList();

        var dto = new PromptPayloadDto(
            template.Identifier.Value,
            messages,
            variables,
            activeVersion.Capability.ToString());

        return Result<PromptPayloadDto>.Success(dto);
    }
}
