using KnowledgeFoundry.Domain.Common.Events;

namespace KnowledgeFoundry.Domain.Lessons.Events;

public sealed class LessonFailedDomainEvent : DomainEvent
{
    public Guid LessonId { get; }
    public string ErrorReason { get; }
    public DateTime FailedAt { get; }

    public LessonFailedDomainEvent(
        Guid lessonId,
        string errorReason,
        DateTime failedAt)
    {
        LessonId = lessonId;
        ErrorReason = errorReason;
        FailedAt = failedAt;
    }
}
