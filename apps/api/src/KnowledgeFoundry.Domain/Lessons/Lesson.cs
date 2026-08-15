using KnowledgeFoundry.Domain.Lessons.Enums;
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

    // Notice this is nullable now! It will be null while 'Generating'
    public LessonContent? Content { get; private set; }

    public LessonStatus Status { get; private set; }
    public string? ErrorMessage { get; private set; } // If generation fails

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

        Status = LessonStatus.Generating; // Starts as generating!
        CreatedAt = DateTime.UtcNow;
    }

    // Phase 1: Creating the record before calling the AI
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

    // Phase 2: Called when the AI successfully returns a payload
    public void MarkAsCompleted(string generatedContent)
    {
        if (Status != LessonStatus.Generating)
            throw new InvalidOperationException("Only generating lessons can be marked as completed.");

        Content = new LessonContent(generatedContent);
        Status = LessonStatus.Completed;
        CompletedAt = DateTime.UtcNow;

        // Future: RaiseDomainEvent(new LessonCompletedDomainEvent(Id));
    }

    // Phase 2: Called if the AI Platform throws an exception
    public void MarkAsFailed(string errorReason)
    {
        if (Status != LessonStatus.Generating)
            throw new InvalidOperationException("Only generating lessons can be marked as failed.");

        ErrorMessage = errorReason;
        Status = LessonStatus.Failed;
        CompletedAt = DateTime.UtcNow;

        // Future: RaiseDomainEvent(new LessonFailedDomainEvent(Id, errorReason));
    }
}
