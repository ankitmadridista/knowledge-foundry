using KnowledgeFoundry.Domain.Common.Events;

namespace KnowledgeFoundry.Domain.Lessons.Events;

public sealed class LessonEvaluatedDomainEvent : DomainEvent
{

    public Guid LessonId { get; }
    public Guid EvaluationId { get; }
    public DateTime EvaluatedAt { get; }

    public LessonEvaluatedDomainEvent(
    Guid lessonId,
    Guid evaluationId,
    DateTime evaluatedAt)
    {
        LessonId = lessonId;
        EvaluationId = evaluationId;
        EvaluatedAt = evaluatedAt;
    }

}
