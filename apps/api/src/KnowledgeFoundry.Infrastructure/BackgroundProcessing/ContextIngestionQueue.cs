using System.Threading.Channels;
using KnowledgeFoundry.Application.BackgroundProcessing;

namespace KnowledgeFoundry.Infrastructure.BackgroundProcessing;

internal sealed class ContextIngestionQueue : IContextIngestionQueue
{
    private readonly Channel<ContextIngestionJob> _queue;

    public ContextIngestionQueue()
    {
        // Bounded channel to prevent memory leaks if ingestion gets backed up
        var options = new BoundedChannelOptions(100)
        {
            FullMode = BoundedChannelFullMode.Wait
        };
        _queue = Channel.CreateBounded<ContextIngestionJob>(options);
    }

    public async ValueTask QueueJobAsync(ContextIngestionJob job, CancellationToken cancellationToken = default)
    {
        await _queue.Writer.WriteAsync(job, cancellationToken);
    }

    public async ValueTask<ContextIngestionJob> DequeueJobAsync(CancellationToken cancellationToken = default)
    {
        return await _queue.Reader.ReadAsync(cancellationToken);
    }
}
