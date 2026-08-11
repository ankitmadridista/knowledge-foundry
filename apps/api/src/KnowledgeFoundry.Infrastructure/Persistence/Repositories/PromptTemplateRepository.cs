using KnowledgeFoundry.Application.Abstractions.Persistence;
using Microsoft.EntityFrameworkCore;
using System.Collections.Immutable;

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
}
