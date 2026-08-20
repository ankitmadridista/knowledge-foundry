using KnowledgeFoundry.Application.Abstractions.Persistence;
using KnowledgeFoundry.Domain.PromptTemplates;
using Microsoft.EntityFrameworkCore;

namespace KnowledgeFoundry.Infrastructure.Persistence.Repositories;

internal sealed class PromptTemplateRepository
    : IPromptTemplateRepository
{
    private readonly KnowledgeFoundryDbContext _dbContext;

    public PromptTemplateRepository(
        KnowledgeFoundryDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task AddAsync(
        PromptTemplate template,
        CancellationToken cancellationToken)
    {
        await _dbContext.PromptTemplates.AddAsync(
            template,
            cancellationToken);
    }

    public async Task<PromptTemplate?> GetByIdAsync(
    Guid id,
    CancellationToken cancellationToken)
    {
        return await _dbContext.PromptTemplates
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

    public async Task<PromptTemplate?> GetByIdentifierAsync(
        string identifier,
        CancellationToken cancellationToken)
    {
        // Notice we are normalizing the identifier to upper case just in case
        var normalizedIdentifier = identifier.ToUpperInvariant();

        return await _dbContext.PromptTemplates
            .Include(x => x.Versions)
                .ThenInclude(v => v.Messages)
            .Include(x => x.Versions)
                .ThenInclude(v => v.Variables)
            .Include(x => x.Tags)
            .FirstOrDefaultAsync(
                x => x.Identifier.Value == normalizedIdentifier,
                cancellationToken);
    }

    public async Task<IReadOnlyList<PromptTemplate>> GetAllAsync(
        CancellationToken cancellationToken)
    {
        return await _dbContext.PromptTemplates
            .Include(x => x.Tags)
            .AsNoTracking()
            .ToListAsync(cancellationToken);
    }

    public async Task<(IReadOnlyList<PromptTemplate> Items, int TotalCount)> GetPagedAsync(
        int pageNumber,
        int pageSize,
        string? searchTerm = null,
        int? provider = null,
        CancellationToken cancellationToken = default)

    {
        var query = _dbContext.PromptTemplates.AsNoTracking();

        if (provider.HasValue)
        {
            query = query.Where(x => (int)x.Provider == provider.Value);
        }

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
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);

        return (items, totalCount);
    }

    public async Task<PromptTemplateVersion?> GetVersionAsync(
        Guid templateId,
        int versionNumber,
        CancellationToken cancellationToken)
    {
        // 1. Fetch the Aggregate Root, and only Include the specific version we want
        var template = await _dbContext.PromptTemplates
            .Include(t => t.Versions.Where(v => v.VersionNumber.Value == versionNumber))
                .ThenInclude(v => v.Messages) // We need the messages for the UI!
            .FirstOrDefaultAsync(
                t => t.Id == templateId,
                cancellationToken);

         //2. Return the single version, or null if not found
        return template?.Versions.FirstOrDefault();
    }

    public async Task<int> CountAsync(CancellationToken cancellationToken = default)
    {
        return await _dbContext.PromptTemplates.CountAsync(cancellationToken);
    }

}
