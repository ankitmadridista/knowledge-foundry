using KnowledgeFoundry.Domain.Common.Events;

namespace KnowledgeFoundry.Domain.Lessons.Events;

public sealed class LessonCompletedDomainEvent : DomainEvent
{
    public Guid LessonId { get; }
    public DateTime CompletedAt { get; }

    public LessonCompletedDomainEvent(
        Guid lessonId,
        DateTime completedAt)
    {
        LessonId = lessonId;
        CompletedAt = completedAt;
    }
}
