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

    public CreateContextPackCommandHandler(IContextPackRepository repository)
    {
        _repository = repository;
    }

    public async Task<Result<Guid>> Handle(
        CreateContextPackCommand request,
        CancellationToken cancellationToken)
    {
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
            request.Tags);

        // 3. Persist to Database
        await _repository.AddAsync(contextPack, cancellationToken);
        await _repository.SaveChangesAsync(cancellationToken);

        // 4. Return the new Guid
        return Result<Guid>.Success(contextPack.Id);
    }
}
