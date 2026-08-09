using KnowledgeFoundry.Domain.PromptTemplates.Events;
using MediatR;

namespace KnowledgeFoundry.IntegrationTests.DomainEvents;

internal sealed class PromptVersionPublishedDomainEventHandlerSpy
    : INotificationHandler<PromptVersionPublishedDomainEvent>
{
    public static bool WasCalled { get; private set; }

    public static void Reset()
    {
        WasCalled = false;
    }

    public Task Handle(
        PromptVersionPublishedDomainEvent notification,
        CancellationToken cancellationToken)
    {
        WasCalled = true;

        return Task.CompletedTask;
    }
}
