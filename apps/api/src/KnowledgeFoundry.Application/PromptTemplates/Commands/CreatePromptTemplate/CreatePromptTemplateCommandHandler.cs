using KnowledgeFoundry.Application.Abstractions.Persistence;
using KnowledgeFoundry.Application.Common.Results;
using MediatR;

namespace KnowledgeFoundry.Application.PromptTemplates.Commands.CreatePromptTemplate;

public sealed class CreatePromptTemplateCommandHandler
    : IRequestHandler<CreatePromptTemplateCommand, Result<Guid>>
{
    private readonly IPromptTemplateRepository _repository;
    private readonly IUnitOfWork _unitOfWork;

    public CreatePromptTemplateCommandHandler(
        IPromptTemplateRepository repository,
        IUnitOfWork unitOfWork)
    {
        _repository = repository;
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<Guid>> Handle(
        CreatePromptTemplateCommand request,
        CancellationToken cancellationToken)
    {
        var template = PromptTemplate.Create(
            request.Identifier,
            request.Name,
            request.Description,
            request.Purpose,
            request.Provider,
            request.Model,
            request.Tags);

        await _repository.AddAsync(
            template,
            cancellationToken);

        // Ownership of the transaction is now correctly delegated to the Unit of Work
        await _unitOfWork.SaveChangesAsync(
            cancellationToken);

        return Result<Guid>.Success(template.Id);
    }
}
