using KnowledgeFoundry.Application.Abstractions.Persistence;
using KnowledgeFoundry.Application.Common.Errors;
using KnowledgeFoundry.Application.Common.Results;
using KnowledgeFoundry.Domain.ContextPacks.ValueObjects;
using MediatR;

namespace KnowledgeFoundry.Application.ContextPacks.Commands.CreateContextVersion;

public sealed class CreateContextVersionCommandHandler
    : IRequestHandler<CreateContextVersionCommand, Result<int>>
{
    private readonly IContextPackRepository _repository;

    public CreateContextVersionCommandHandler(IContextPackRepository repository)
    {
        _repository = repository;
    }

    public async Task<Result<int>> Handle(
        CreateContextVersionCommand request,
        CancellationToken cancellationToken)
    {
        // 1. Fetch the Aggregate Root
        var contextPack = await _repository.GetByIdAsync(request.ContextPackId, cancellationToken);

        if (contextPack is null)
        {
            return Result<int>.Failure(ContextPackErrors.NotFound);
        }

        // 2. Map DTOs to Domain Value Objects
        var sections = request.Sections.Select(dto =>
            new ContextSection(dto.Title, dto.Content, dto.Order)).ToList();

        // 3. Create the new Version (The Domain handles the incrementing logic!)
        var newVersion = contextPack.CreateVersion(sections);

        // 4. Save changes
        await _repository.SaveChangesAsync(cancellationToken);

        // 5. Return the new version number
        return Result<int>.Success(newVersion.VersionNumber.Value);
    }
}
