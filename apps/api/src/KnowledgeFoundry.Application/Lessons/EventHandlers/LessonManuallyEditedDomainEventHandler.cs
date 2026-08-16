using KnowledgeFoundry.Domain.Lessons.Events;
using MediatR;
using Microsoft.Extensions.Logging;

namespace KnowledgeFoundry.Application.Lessons.EventHandlers;

internal sealed class LessonManuallyEditedDomainEventHandler
    : INotificationHandler<LessonManuallyEditedDomainEvent>
{
    private readonly ILogger<LessonManuallyEditedDomainEventHandler> _logger;

    public LessonManuallyEditedDomainEventHandler(ILogger<LessonManuallyEditedDomainEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(
        LessonManuallyEditedDomainEvent notification,
        CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "📝 DOMAIN EVENT FIRED: Lesson {LessonId} was manually edited by a user at {Time}",
            notification.LessonId,
            notification.EditedAt);

        // Future capabilities:
        // - Update the lesson's search index (Elasticsearch/Algolia) with the new text
        // - Track analytics: "What % of AI lessons require human edits?"
        // - Clear cached versions of this lesson

        return Task.CompletedTask;
    }
}
