using KnowledgeFoundry.Application.Abstractions.Persistence;
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
        return await _dbContext.PromptTemplates.FirstOrDefaultAsync(
            x => x.Id == id,
            cancellationToken);
    }

    public Task SaveChangesAsync(
        CancellationToken cancellationToken)
    {
        return _dbContext.SaveChangesAsync(cancellationToken);
    }
}
