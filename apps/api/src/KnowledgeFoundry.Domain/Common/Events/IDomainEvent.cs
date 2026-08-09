using MediatR;

namespace KnowledgeFoundry.Domain.Common.Events;

public interface IDomainEvent : INotification
{
    DateTime OccurredOnUtc { get; }
}
