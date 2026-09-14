namespace KnowledgeFoundry.Application.BackgroundProcessing;

public interface IContextIngestionQueue
{
    ValueTask QueueJobAsync(ContextIngestionJob job, CancellationToken cancellationToken = default);
    ValueTask<ContextIngestionJob> DequeueJobAsync(CancellationToken cancellationToken = default);
}
