using KnowledgeFoundry.Infrastructure.Persistence;

namespace KnowledgeFoundry.Infrastructure.DomainEvents;

internal interface IDomainEventDispatcher
{
    Task DispatchAsync(
        KnowledgeFoundryDbContext dbContext,
        CancellationToken cancellationToken);
}
