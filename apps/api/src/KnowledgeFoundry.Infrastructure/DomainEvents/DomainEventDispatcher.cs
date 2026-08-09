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
        var domainEvents =
            dbContext.ChangeTracker
                .Entries<Entity>()
                .Select(entry => entry.Entity)
                .SelectMany(entity => entity.DomainEvents)
                .ToList();

        foreach (var domainEvent in domainEvents)
        {
            await _publisher.Publish(
                domainEvent,
                cancellationToken);
        }

        foreach (var entity in
                 dbContext.ChangeTracker
                     .Entries<Entity>()
                     .Select(entry => entry.Entity))
        {
            entity.ClearDomainEvents();
        }
    }
}
