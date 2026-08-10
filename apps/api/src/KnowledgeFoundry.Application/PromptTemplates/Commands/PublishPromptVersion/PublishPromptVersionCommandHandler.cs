using KnowledgeFoundry.Application.Abstractions.Persistence;
using KnowledgeFoundry.Application.Common.Errors;
using KnowledgeFoundry.Application.Common.Results;
using KnowledgeFoundry.Domain.PromptTemplates.ValueObjects;
using MediatR;

namespace KnowledgeFoundry.Application.PromptTemplates.Commands.PublishPromptVersion;

public sealed class PublishPromptVersionCommandHandler
    : IRequestHandler<PublishPromptVersionCommand, Result<bool>>
{
    private readonly IPromptTemplateRepository _repository;
    private readonly IUnitOfWork _unitOfWork;

    public PublishPromptVersionCommandHandler(
        IPromptTemplateRepository repository,
        IUnitOfWork unitOfWork)
    {
        _repository = repository;
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<bool>> Handle(
        PublishPromptVersionCommand request,
        CancellationToken cancellationToken)
    {
        var template = await _repository.GetByIdAsync(request.PromptTemplateId, cancellationToken);

        if (template is null)
        {
            return Result<bool>.Failure(PromptTemplateErrors.NotFound);
        }

        // Call our domain model to enforce rules and transition state
        template.PublishVersion(new PromptVersionNumber(request.VersionNumber));

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result<bool>.Success(true);
    }
}
