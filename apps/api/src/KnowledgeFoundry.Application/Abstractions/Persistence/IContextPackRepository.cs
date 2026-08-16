using KnowledgeFoundry.Domain.ContextPacks;

namespace KnowledgeFoundry.Application.Abstractions.Persistence;

public interface IContextPackRepository
{
    Task AddAsync(ContextPack contextPack, CancellationToken cancellationToken);

    Task<ContextPack?> GetByIdAsync(Guid id, CancellationToken cancellationToken);

    Task<ContextPack?> GetByIdentifierAsync(string identifier, CancellationToken cancellationToken);

    Task<IReadOnlyList<ContextPack>> GetAllAsync(CancellationToken cancellationToken);

    Task<ContextPackVersion?> GetVersionAsync(Guid packId, int versionNumber, CancellationToken cancellationToken);

    Task<(IReadOnlyList<ContextPack> Items, int TotalCount)> GetPagedAsync(
        int pageNumber,
        int pageSize,
        CancellationToken cancellationToken = default);

    Task SaveChangesAsync(CancellationToken cancellationToken);
}
