using KnowledgeFoundry.Domain.PromptTemplates.Events;
using MediatR;
using Microsoft.Extensions.Logging;

namespace KnowledgeFoundry.Application.PromptTemplates.EventHandlers;

internal sealed class PromptVersionPublishedDomainEventHandler
    : INotificationHandler<PromptVersionPublishedDomainEvent>
{
    private readonly ILogger<PromptVersionPublishedDomainEventHandler> _logger;

    public PromptVersionPublishedDomainEventHandler(ILogger<PromptVersionPublishedDomainEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(
        PromptVersionPublishedDomainEvent notification,
        CancellationToken cancellationToken)
    {
        // This log will appear in your .NET console, proving the event dispatcher works!
        _logger.LogInformation(
            "✅ DOMAIN EVENT FIRED: Prompt Template {TemplateId} published Version {VersionNumber} at {Time}",
            notification.PromptTemplateId,
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
