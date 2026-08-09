using KnowledgeFoundry.Domain.PromptTemplates.Events;
using MediatR;

namespace KnowledgeFoundry.Application.PromptTemplates.EventHandlers;

internal sealed class PromptVersionPublishedDomainEventHandler
    : INotificationHandler<PromptVersionPublishedDomainEvent>
{
    public Task Handle(
        PromptVersionPublishedDomainEvent notification,
        CancellationToken cancellationToken)
    {
        // Future:
        // - Warm prompt cache
        // - Send audit event
        // - Start evaluation pipeline
        // - Update search index

        return Task.CompletedTask;
    }
}
