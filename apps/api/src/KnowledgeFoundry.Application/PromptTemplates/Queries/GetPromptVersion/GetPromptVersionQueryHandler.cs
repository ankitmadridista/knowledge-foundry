using KnowledgeFoundry.Application.Abstractions.Persistence;
using KnowledgeFoundry.Application.Common.Errors;
using KnowledgeFoundry.Application.Common.Models;
using KnowledgeFoundry.Application.Common.Results;
using MediatR;

namespace KnowledgeFoundry.Application.PromptTemplates.Queries.GetPromptVersion
{
    public class GetPromptVersionQueryHandler
    : IRequestHandler<GetPromptVersionQuery, Result<PromptVersionDetailsDto>>
    {
        private readonly IPromptTemplateRepository _repository;

        public GetPromptVersionQueryHandler(IPromptTemplateRepository repository)
        {
            _repository = repository;
        }
        public async Task<Result<PromptVersionDetailsDto>> Handle(GetPromptVersionQuery request, CancellationToken cancellationToken)
        {
            var version = await _repository.GetVersionAsync(
                request.TemplateId,
                request.VersionNumber,
                cancellationToken);

            if (version is null)
            {
                return Result<PromptVersionDetailsDto>.Failure(PromptTemplateErrors.NotFound);
            }

            // Map the Domain Entity to the Application DTO
        var dto = new PromptVersionDetailsDto(
            version.VersionNumber.Value,
            version.Status,
            (int)version.Capability,
            version.CreatedAt,
            version.Messages.Select(m => new PromptMessageDto(
                m.Role,
                m.Content,
                m.Order
            )).OrderBy(m => m.Order).ToList().AsReadOnly() // Ensure correct order!
        );

        return Result<PromptVersionDetailsDto>.Success(dto);
        }
    }
}
