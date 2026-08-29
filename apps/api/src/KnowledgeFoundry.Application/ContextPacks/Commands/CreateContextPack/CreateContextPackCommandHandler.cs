using KnowledgeFoundry.Application.Abstractions.Persistence;
using KnowledgeFoundry.Application.Common.Errors;
using KnowledgeFoundry.Application.Common.Results;
using KnowledgeFoundry.Domain.ContextPacks;
using MediatR;

namespace KnowledgeFoundry.Application.ContextPacks.Commands.CreateContextPack;

public sealed class CreateContextPackCommandHandler
    : IRequestHandler<CreateContextPackCommand, Result<Guid>>
{
    private readonly IContextPackRepository _repository;
    private readonly ICorpSettingsRepository _settingsRepository;
    private readonly IUnitOfWork _unitOfWork;

    public CreateContextPackCommandHandler(
        IContextPackRepository repository,
        ICorpSettingsRepository settingsRepository,
        IUnitOfWork unitOfWork)
    {
        _repository = repository;
        _settingsRepository = settingsRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<Guid>> Handle(
        CreateContextPackCommand request,
        CancellationToken cancellationToken)
    {
        var currentCount = await _repository.CountAsync(cancellationToken);
        var settings = await _settingsRepository.GetSettingsAsync(cancellationToken);

        if (currentCount >= settings.MaxContextPacks)
        {
            return Result<Guid>.Failure(new Error(
                "Quota.Exceeded",
                $"You have reached the maximum allowed Context Packs ({settings.MaxContextPacks}). Upgrade your plan to create more."));
        }

        // 1. Check for identifier uniqueness
        var existingPack = await _repository.GetByIdentifierAsync(request.Identifier, cancellationToken);
        if (existingPack is not null)
        {
            return Result<Guid>.Failure(ContextPackErrors.IdentifierNotUnique);
        }

        // 2. Create the Domain Entity
        var contextPack = ContextPack.Create(
            request.Identifier,
            request.Name,
            request.Description,
            null,
            request.Tags);

        // 3. Persist to Database
        await _repository.AddAsync(contextPack, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        // 4. Return the new Guid
        return Result<Guid>.Success(contextPack.Id);
    }
}
