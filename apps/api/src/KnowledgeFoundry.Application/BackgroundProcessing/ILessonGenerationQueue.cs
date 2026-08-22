namespace KnowledgeFoundry.Application.BackgroundProcessing;

public interface ILessonGenerationQueue
{
    ValueTask QueueLessonAsync(LessonGenerationJob job, CancellationToken cancellationToken);
    ValueTask<LessonGenerationJob> DequeueAsync(CancellationToken cancellationToken);
}
