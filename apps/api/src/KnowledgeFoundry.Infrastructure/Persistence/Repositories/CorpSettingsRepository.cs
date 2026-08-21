using KnowledgeFoundry.Application.Abstractions.Persistence;
using KnowledgeFoundry.Domain.Settings;
using Microsoft.EntityFrameworkCore;

namespace KnowledgeFoundry.Infrastructure.Persistence.Repositories;

internal sealed class CorpSettingsRepository : ICorpSettingsRepository
{
    private readonly KnowledgeFoundryDbContext _dbContext;

    public CorpSettingsRepository(KnowledgeFoundryDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<CorpSettings> GetSettingsAsync(CancellationToken cancellationToken = default)
    {
        var settings = await _dbContext.CorpSettings
            .FirstOrDefaultAsync(x => x.Id == CorpSettings.GlobalSettingsId, cancellationToken);

        // Fallback just in case the seeder hasn't run yet, though it shouldn't happen
        return settings ?? CorpSettings.Create();
    }
}
