using KnowledgeFoundry.Infrastructure.Persistence;

namespace KnowledgeFoundry.Infrastructure.DomainEvents;

public interface IDomainEventDispatcher
{
    Task DispatchAsync(
        KnowledgeFoundryDbContext dbContext,
        CancellationToken cancellationToken);
}
