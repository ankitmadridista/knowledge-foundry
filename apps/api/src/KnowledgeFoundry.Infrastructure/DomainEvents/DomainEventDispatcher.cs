using KnowledgeFoundry.Infrastructure.Persistence;
using MediatR;

namespace KnowledgeFoundry.Infrastructure.DomainEvents;

internal sealed class DomainEventDispatcher
    : IDomainEventDispatcher
{
    private readonly IPublisher _publisher;

    public DomainEventDispatcher(
        IPublisher publisher)
    {
        _publisher = publisher;
    }

    public async Task DispatchAsync(
        KnowledgeFoundryDbContext dbContext,
        CancellationToken cancellationToken)
    {
        var entities =
            dbContext.ChangeTracker
                .Entries<Entity>()
                .Select(entry => entry.Entity)
                .Where(entity => entity.DomainEvents.Count > 0)
                .ToList();

        var domainEvents =
            entities
                .SelectMany(entity => entity.DomainEvents)
                .ToList();

        foreach (var domainEvent in domainEvents)
        {
            await _publisher.Publish(
                domainEvent,
                cancellationToken);
        }

        foreach (var entity in entities)
        {
            entity.ClearDomainEvents();
        }
    }
}
