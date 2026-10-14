namespace KnowledgeFoundry.Application.BackgroundProcessing;

public sealed record QuizGenerationJob(
    Guid QuizId,
    Guid LessonId,
    Guid PromptTemplateId,
    int QuestionCount,
    string QuizFormat,
    int? OverrideProvider,
    string? OverrideModel);

public interface IQuizGenerationQueue
{
    ValueTask QueueQuizAsync(QuizGenerationJob job, CancellationToken cancellationToken);
    ValueTask<QuizGenerationJob> DequeueAsync(CancellationToken cancellationToken);
}
