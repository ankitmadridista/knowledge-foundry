using KnowledgeFoundry.Domain.Settings;

namespace KnowledgeFoundry.Application.Abstractions.Persistence;

public interface ICorpSettingsRepository
{
    Task<CorpSettings> GetSettingsAsync(CancellationToken cancellationToken = default);
}
