using KnowledgeFoundry.Domain.AiPlatform;

namespace KnowledgeFoundry.Application.Abstractions.Persistence;

public interface IAiExecutionLogRepository
{
    Task AddAsync(AiExecutionLog log, CancellationToken cancellationToken = default);
    Task<AiExecutionLog?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default); // <-- NEW
}
