using KnowledgeFoundry.Application.Abstractions.Persistence;
using KnowledgeFoundry.Domain.AiPlatform;
using Microsoft.EntityFrameworkCore;

namespace KnowledgeFoundry.Infrastructure.Persistence.Repositories;

internal sealed class AiExecutionLogRepository : IAiExecutionLogRepository
{
    private readonly KnowledgeFoundryDbContext _dbContext;

    public AiExecutionLogRepository(KnowledgeFoundryDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task AddAsync(AiExecutionLog log, CancellationToken cancellationToken = default)
    {
        // Note: You will get a red squiggly on .AiExecutionLogs until you add the DbSet in step 3!
        await _dbContext.Set<AiExecutionLog>().AddAsync(log, cancellationToken);
    }

    public async Task<AiExecutionLog?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _dbContext.Set<AiExecutionLog>()
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);
    }
}
