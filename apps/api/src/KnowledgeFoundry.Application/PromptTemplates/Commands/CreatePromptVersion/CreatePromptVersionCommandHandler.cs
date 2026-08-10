using KnowledgeFoundry.Application.Abstractions.Persistence;
using KnowledgeFoundry.Application.Common.Errors;
using KnowledgeFoundry.Application.Common.Results;
using KnowledgeFoundry.Domain.PromptTemplates.ValueObjects;
using MediatR;

namespace KnowledgeFoundry.Application.PromptTemplates.Commands.CreatePromptVersion;

public sealed class CreatePromptVersionCommandHandler
    : IRequestHandler<CreatePromptVersionCommand, Result<int>>
{
    private readonly IPromptTemplateRepository _repository;
    private readonly IUnitOfWork _unitOfWork;

    public CreatePromptVersionCommandHandler(
        IPromptTemplateRepository repository,
        IUnitOfWork unitOfWork)
    {
        _repository = repository;
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<int>> Handle(
        CreatePromptVersionCommand request,
        CancellationToken cancellationToken)
    {
        // 1. Fetch the aggregate root
        var template = await _repository.GetByIdAsync(request.PromptTemplateId, cancellationToken);

        if (template is null)
        {
            return Result<int>.Failure(PromptTemplateErrors.NotFound);
        }

        // 2. Map the incoming DTOs to our Domain Value Objects
        var domainMessages = request.Messages
            .Select(m => new PromptMessage(m.Role, m.Content, m.Order))
            .ToList();

        // 3. Perform the domain action
        var version = template.CreateVersion(domainMessages, request.Capability);

        // 4. Save the transaction
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        // 5. Return the generated version number
        return Result<int>.Success(version.VersionNumber.Value);
    }
}
