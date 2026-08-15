using KnowledgeFoundry.Domain.ContextPacks.Events;
using MediatR;
using Microsoft.Extensions.Logging;

namespace KnowledgeFoundry.Application.ContextPacks.EventHandlers;

internal sealed class ContextVersionPublishedDomainEventHandler
    : INotificationHandler<ContextPackVersionPublishedDomainEvent>
{
    private readonly ILogger<ContextVersionPublishedDomainEventHandler> _logger;

    public ContextVersionPublishedDomainEventHandler(ILogger<ContextVersionPublishedDomainEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(
        ContextPackVersionPublishedDomainEvent notification,
        CancellationToken cancellationToken)
    {
        // This log will appear in your .NET console, proving the event dispatcher works!
        _logger.LogInformation(
            "✅ DOMAIN EVENT FIRED: Context Pack {ContextPackId} published Version {VersionNumber} at {Time}",
            notification.ContextPackId,
            notification.VersionNumber.Value, // Using .Value because it's a strongly-typed ValueObject
            notification.PublishedAt);

        // Future:
        // - Warm prompt cache
        // - Send audit event
        // - Start evaluation pipeline
        // - Update search index

        return Task.CompletedTask;
    }
}
