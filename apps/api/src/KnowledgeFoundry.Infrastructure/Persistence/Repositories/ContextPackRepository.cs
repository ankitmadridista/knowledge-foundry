using KnowledgeFoundry.Application.Abstractions.Persistence;
using KnowledgeFoundry.Domain.ContextPacks;
using Microsoft.EntityFrameworkCore;

namespace KnowledgeFoundry.Infrastructure.Persistence.Repositories;

internal sealed class ContextPackRepository : IContextPackRepository
{
    private readonly KnowledgeFoundryDbContext _dbContext;

    public ContextPackRepository(KnowledgeFoundryDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task AddAsync(
        ContextPack contextPack,
        CancellationToken cancellationToken)
    {
        await _dbContext.ContextPacks.AddAsync(
            contextPack,
            cancellationToken);
    }

    public async Task<ContextPack?> GetByIdAsync(
        Guid id,
        CancellationToken cancellationToken)
    {
        return await _dbContext.ContextPacks
            .Include(x => x.Versions)
            .Include(x => x.Tags)
            .FirstOrDefaultAsync(
                x => x.Id == id,
                cancellationToken);
    }

    public Task SaveChangesAsync(
        CancellationToken cancellationToken)
    {
        return _dbContext.SaveChangesAsync(cancellationToken);
    }

    public async Task<ContextPack?> GetByIdentifierAsync(
        string identifier,
        CancellationToken cancellationToken)
    {
        // Normalize the identifier to upper case just in case
        var normalizedIdentifier = identifier.ToUpperInvariant();

        return await _dbContext.ContextPacks
            .Include(x => x.Versions)
                .ThenInclude(v => v.Sections) // Ensure Markdown sections are loaded
            .Include(x => x.Tags)
            .FirstOrDefaultAsync(
                x => x.Identifier.Value == normalizedIdentifier,
                cancellationToken);
    }

    public async Task<IReadOnlyList<ContextPack>> GetAllAsync(
        CancellationToken cancellationToken)
    {
        return await _dbContext.ContextPacks
            .Include(x => x.Tags)
            .Include(x => x.Versions) // Included to quickly calculate "ActiveVersion" for list views
            .AsNoTracking()
            .ToListAsync(cancellationToken);
    }

    public async Task<(IReadOnlyList<ContextPack> Items, int TotalCount)> GetPagedAsync(
        int pageNumber,
        int pageSize,
        CancellationToken cancellationToken = default)
    {
        var query = _dbContext.ContextPacks.AsNoTracking();

        // 1. Get the total number of records (Extremely fast in SQL)
        var totalCount = await query.CountAsync(cancellationToken);

        // 2. Fetch only the specific page of data
        var items = await query
            .Include(x => x.Tags)
            .Include(x => x.Versions)
            .Skip((pageNumber - 1) * pageSize) // e.g. Page 2 of 10 items skips the first 10
            .Take(pageSize)                    // and takes the next 10
            .ToListAsync(cancellationToken);

        return (items, totalCount);
    }

    public async Task<ContextPackVersion?> GetVersionAsync(
        Guid packId,
        int versionNumber,
        CancellationToken cancellationToken)
    {
        // 1. Fetch the Aggregate Root, and only Include the specific version we want
        var pack = await _dbContext.ContextPacks
            .Include(p => p.Versions.Where(v => v.VersionNumber.Value == versionNumber))
                .ThenInclude(v => v.Sections) // We need the markdown content!
            .FirstOrDefaultAsync(
                p => p.Id == packId,
                cancellationToken);

        // 2. Return the single version, or null if not found
        return pack?.Versions.FirstOrDefault();
    }
}
