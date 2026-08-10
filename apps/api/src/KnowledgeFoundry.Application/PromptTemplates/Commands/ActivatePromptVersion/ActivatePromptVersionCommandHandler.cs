using KnowledgeFoundry.Application.Abstractions.Persistence;
using KnowledgeFoundry.Application.Common.Errors;
using KnowledgeFoundry.Application.Common.Results;
using KnowledgeFoundry.Domain.PromptTemplates.ValueObjects;
using MediatR;

namespace KnowledgeFoundry.Application.PromptTemplates.Commands.ActivatePromptVersion;

public sealed class ActivatePromptVersionCommandHandler
    : IRequestHandler<ActivatePromptVersionCommand, Result<bool>>
{
    private readonly IPromptTemplateRepository _repository;
    private readonly IUnitOfWork _unitOfWork;

    public ActivatePromptVersionCommandHandler(
        IPromptTemplateRepository repository,
        IUnitOfWork unitOfWork)
    {
        _repository = repository;
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<bool>> Handle(
        ActivatePromptVersionCommand request,
        CancellationToken cancellationToken)
    {
        var template = await _repository.GetByIdAsync(request.PromptTemplateId, cancellationToken);

        if (template is null)
        {
            return Result<bool>.Failure(PromptTemplateErrors.NotFound);
        }

        // Call our domain model to enforce rules (must be published first, deprecate old active version, etc.)
        template.ActivateVersion(new PromptVersionNumber(request.VersionNumber));

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result<bool>.Success(true);
    }
}
