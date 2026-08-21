using KnowledgeFoundry.Application.Abstractions.Persistence;
using KnowledgeFoundry.Application.Common.Results;
using MediatR;

namespace KnowledgeFoundry.Application.PromptTemplates.Commands.CreatePromptTemplate;

public sealed class CreatePromptTemplateCommandHandler
    : IRequestHandler<CreatePromptTemplateCommand, Result<Guid>>
{
    private readonly IPromptTemplateRepository _repository;
    private readonly ICorpSettingsRepository _settingsRepository;
    private readonly IUnitOfWork _unitOfWork;

    public CreatePromptTemplateCommandHandler(
        IPromptTemplateRepository repository,
        ICorpSettingsRepository settingsRepository,
        IUnitOfWork unitOfWork)
    {
        _repository = repository;
        _settingsRepository = settingsRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<Guid>> Handle(
        CreatePromptTemplateCommand request,
        CancellationToken cancellationToken)
    {
        var currentCount = await _repository.CountAsync(cancellationToken);
        var settings = await _settingsRepository.GetSettingsAsync(cancellationToken);

        if (currentCount >= settings.MaxPromptTemplates)
        {
            return Result<Guid>.Failure(new Error(
                "Quota.Exceeded",
                $"You have reached the maximum allowed Prompt Templates ({settings.MaxPromptTemplates}). Upgrade your plan to create more."));
        }

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
