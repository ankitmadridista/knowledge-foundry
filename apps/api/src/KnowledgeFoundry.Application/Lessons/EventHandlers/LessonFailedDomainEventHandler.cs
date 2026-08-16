using KnowledgeFoundry.Domain.Lessons.Events;
using MediatR;
using Microsoft.Extensions.Logging;

namespace KnowledgeFoundry.Application.Lessons.EventHandlers;

internal sealed class LessonFailedDomainEventHandler
    : INotificationHandler<LessonFailedDomainEvent>
{
    private readonly ILogger<LessonFailedDomainEventHandler> _logger;

    public LessonFailedDomainEventHandler(ILogger<LessonFailedDomainEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(
        LessonFailedDomainEvent notification,
        CancellationToken cancellationToken)
    {
        _logger.LogWarning(
            "❌ DOMAIN EVENT FIRED: AI Lesson {LessonId} generation FAILED at {Time}. Reason: {ErrorReason}",
            notification.LessonId,
            notification.FailedAt,
            notification.ErrorReason);

        // Future capabilities:
        // - Push WebSocket notification to the user about the failure
        // - Trigger an alert to the engineering team if AI failures spike
        // - Auto-retry mechanism

        return Task.CompletedTask;
    }
}
