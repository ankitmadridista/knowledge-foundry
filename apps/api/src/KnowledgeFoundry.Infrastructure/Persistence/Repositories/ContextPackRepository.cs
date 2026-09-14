using KnowledgeFoundry.Application.Abstractions.Persistence;
using KnowledgeFoundry.Domain.ContextPacks;
using KnowledgeFoundry.Domain.ContextPacks.Enums;
using Microsoft.EntityFrameworkCore;
using Pgvector.EntityFrameworkCore;
using Pgvector;

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
        string? searchTerm = null,
        CancellationToken cancellationToken = default)
    {
        var query = _dbContext.ContextPacks.AsNoTracking();

        if (!string.IsNullOrWhiteSpace(searchTerm))
        {
            var search = searchTerm.ToLower();

            query = query.Where(x =>
                x.Name.Value.ToLower().Contains(search) ||
                x.Identifier.Value.ToLower().Contains(search) ||
                x.Description.Value.ToLower().Contains(search) ||
                x.Tags.Any(t => t.Value.ToLower().Contains(search))
            );
        }

        var totalCount = await query.CountAsync(cancellationToken);

        var items = await query
            .Include(x => x.Tags)
            .Include(x => x.Versions)
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
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

    public async Task<int> CountAsync(CancellationToken cancellationToken = default)
    {
        return await _dbContext.ContextPacks.CountAsync(cancellationToken);
    }

    public async Task<string> GetRelevantContextAsync(
        Guid packId,
        float[] queryEmbedding,
        int maxTokens,
        CancellationToken cancellationToken)
    {
        return await ExecuteVectorSearchAsync(
            pack => pack.Id == packId,
            queryEmbedding,
            maxTokens,
            cancellationToken);
    }

    public async Task<string> GetRelevantContextByIdentifierAsync(
        string identifier,
        float[] queryEmbedding,
        int maxTokens,
        CancellationToken cancellationToken)
    {
        var normalizedIdentifier = identifier.ToUpperInvariant();

        return await ExecuteVectorSearchAsync(
            pack => pack.Identifier.Value == normalizedIdentifier,
            queryEmbedding,
            maxTokens,
            cancellationToken);
    }

    private async Task<string> ExecuteVectorSearchAsync(
        System.Linq.Expressions.Expression<Func<ContextPack, bool>> packPredicate,
        float[] queryEmbedding,
        int maxTokens,
        CancellationToken cancellationToken)
    {
        // 1. Convert the raw C# float array into the Pgvector type for the query
        var queryVector = new Vector(queryEmbedding);

        // 2. Ask Postgres to calculate Cosine Distance on the server
        var relevantChunks = await _dbContext.ContextPacks
            .Where(packPredicate)
            .SelectMany(p => p.Versions)
            .Where(v => v.Status == ContextPackStatus.Active)
            .SelectMany(v => v.Chunks)
            .OrderBy(c => EF.Property<Vector>(c, "Embedding").CosineDistance(queryVector))
            .Take(20)
            .ToListAsync(cancellationToken);

        if (!relevantChunks.Any())
        {
            return string.Empty;
        }

        // 3. Reassemble the chunks into a clean markdown document up to the token limit
        var sb = new System.Text.StringBuilder();
        int currentTokens = 0;

        var groupedChunks = relevantChunks.GroupBy(c => c.SectionTitle);

        foreach (var group in groupedChunks)
        {
            sb.AppendLine($"## {group.Key}");

            foreach (var chunk in group.OrderBy(c => c.OrderIndex))
            {
                if (currentTokens + chunk.TokenCount > maxTokens)
                {
                    break;
                }

                sb.AppendLine(chunk.Content);
                sb.AppendLine("...");

                currentTokens += chunk.TokenCount;
            }

            sb.AppendLine();
        }

        return sb.ToString().TrimEnd();
    }

}
