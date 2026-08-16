using KnowledgeFoundry.Domain.Lessons.Events;
using MediatR;
using Microsoft.Extensions.Logging;

namespace KnowledgeFoundry.Application.Lessons.EventHandlers;

internal sealed class LessonCompletedDomainEventHandler
    : INotificationHandler<LessonCompletedDomainEvent>
{
    private readonly ILogger<LessonCompletedDomainEventHandler> _logger;

    public LessonCompletedDomainEventHandler(ILogger<LessonCompletedDomainEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(
        LessonCompletedDomainEvent notification,
        CancellationToken cancellationToken)
    {
        // This log will appear in your .NET console
        _logger.LogInformation(
            "🎓 DOMAIN EVENT FIRED: AI Lesson {LessonId} successfully generated at {Time}",
            notification.LessonId,
            notification.CompletedAt);

        // Future capabilities:
        // - Push SignalR/WebSocket notification to frontend so the UI updates automatically!
        // - Send email: "Your lesson on Mars Rovers is ready"
        // - Send payload to a PDF generator service

        return Task.CompletedTask;
    }
}
