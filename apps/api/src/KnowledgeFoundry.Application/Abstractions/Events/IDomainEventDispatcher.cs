using KnowledgeFoundry.Domain.Common.Events;

namespace KnowledgeFoundry.Application.Abstractions.Events;

public interface IDomainEventDispatcher
{
    Task DispatchAsync(
        IReadOnlyCollection<IDomainEvent> domainEvents,
        CancellationToken cancellationToken);
}
