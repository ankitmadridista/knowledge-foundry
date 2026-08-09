using KnowledgeFoundry.Domain.PromptTemplates.Events;
using MediatR;

namespace KnowledgeFoundry.IntegrationTests.DomainEvents;

internal sealed class ThrowingPromptVersionPublishedDomainEventHandler
    : INotificationHandler<PromptVersionPublishedDomainEvent>
{
    public Task Handle(
        PromptVersionPublishedDomainEvent notification,
        CancellationToken cancellationToken)
    {
        throw new InvalidOperationException(
            "Test handler failure.");
    }
}
