using KnowledgeFoundry.Application.BackgroundProcessing;
using System.Threading.Channels;

namespace KnowledgeFoundry.Infrastructure.BackgroundProcessing;

public sealed class LessonGenerationQueue : ILessonGenerationQueue
{
    private readonly Channel<LessonGenerationJob> _queue;

    public LessonGenerationQueue()
    {
        // Unbounded channel means it can hold as many jobs as users submit
        var options = new UnboundedChannelOptions
        {
            SingleReader = true, // Our background service will be the only thing reading from this
            SingleWriter = false
        };
        _queue = Channel.CreateUnbounded<LessonGenerationJob>(options);
    }

    public async ValueTask QueueLessonAsync(LessonGenerationJob job, CancellationToken cancellationToken)
    {
        await _queue.Writer.WriteAsync(job, cancellationToken);
    }

    public async ValueTask<LessonGenerationJob> DequeueAsync(CancellationToken cancellationToken)
    {
        return await _queue.Reader.ReadAsync(cancellationToken);
    }
}
