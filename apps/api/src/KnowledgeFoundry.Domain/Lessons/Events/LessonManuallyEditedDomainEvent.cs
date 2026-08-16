using KnowledgeFoundry.Domain.Common.Events;

namespace KnowledgeFoundry.Domain.Lessons.Events;

public sealed class LessonManuallyEditedDomainEvent : DomainEvent
{
    public Guid LessonId { get; }
    public DateTime EditedAt { get; }

    public LessonManuallyEditedDomainEvent(
        Guid lessonId,
        DateTime editedAt)
    {
        LessonId = lessonId;
        EditedAt = editedAt;
    }
}
