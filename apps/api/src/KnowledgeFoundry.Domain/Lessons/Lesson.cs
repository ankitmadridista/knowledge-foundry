using KnowledgeFoundry.Domain.Lessons.Enums;
using KnowledgeFoundry.Domain.Lessons.Events;
using KnowledgeFoundry.Domain.Lessons.ValueObjects;

namespace KnowledgeFoundry.Domain.Lessons;

public sealed class Lesson : Entity
{
    private Lesson()
    {
        // Parameterless constructor required by EF Core
    }

    public LessonTitle Title { get; private set; } = null!;
    public LessonTopic Topic { get; private set; } = null!;
    public LessonAudience Audience { get; private set; } = null!;

    public LessonContent? Content { get; private set; }

    public LessonStatus Status { get; private set; }
    public string? ErrorMessage { get; private set; }
    public bool IsManuallyEdited { get; private set; }

    // Traceability
    public Guid PromptTemplateId { get; private set; }
    public Guid? ContextPackId { get; private set; }

    public DateTime CreatedAt { get; private set; }
    public DateTime? CompletedAt { get; private set; }

    private Lesson(
        LessonTitle title,
        LessonTopic topic,
        LessonAudience audience,
        Guid promptTemplateId,
        Guid? contextPackId)
    {
        Title = title ?? throw new ArgumentNullException(nameof(title));
        Topic = topic ?? throw new ArgumentNullException(nameof(topic));
        Audience = audience ?? throw new ArgumentNullException(nameof(audience));

        PromptTemplateId = promptTemplateId;
        ContextPackId = contextPackId;

        Status = LessonStatus.Generating;
        IsManuallyEdited = false; // Defaults to false!
        CreatedAt = DateTime.UtcNow;
    }

    public static Lesson CreatePending(
        string title,
        string topic,
        string audience,
        Guid promptTemplateId,
        Guid? contextPackId = null)
    {
        return new Lesson(
            new LessonTitle(title),
            new LessonTopic(topic),
            new LessonAudience(audience),
            promptTemplateId,
            contextPackId);
    }

    public void MarkAsCompleted(string generatedContent)
    {
        if (Status != LessonStatus.Generating)
            throw new InvalidOperationException("Only generating lessons can be marked as completed.");

        Content = new LessonContent(generatedContent);
        Status = LessonStatus.Completed;
        CompletedAt = DateTime.UtcNow;

        RaiseDomainEvent(new LessonCompletedDomainEvent(Id, CompletedAt.Value));
    }

    public void MarkAsFailed(string errorReason)
    {
        if (Status != LessonStatus.Generating)
            throw new InvalidOperationException("Only generating lessons can be marked as failed.");

        ErrorMessage = errorReason;
        Status = LessonStatus.Failed;
        CompletedAt = DateTime.UtcNow;

        RaiseDomainEvent(new LessonFailedDomainEvent(Id, errorReason, CompletedAt.Value));
    }

    public void UpdateContentManually(string newContent)
    {
        if (Status != LessonStatus.Completed)
            throw new InvalidOperationException("Only completed lessons can be manually edited.");

        Content = new LessonContent(newContent);
        IsManuallyEdited = true;

        RaiseDomainEvent(new LessonManuallyEditedDomainEvent(Id, DateTime.UtcNow));
    }
}
