using KnowledgeFoundry.Application.BackgroundProcessing;
using System.Threading.Channels;

namespace KnowledgeFoundry.Infrastructure.BackgroundProcessing;

public sealed class QuizGenerationQueue : IQuizGenerationQueue
{
    private readonly Channel<QuizGenerationJob> _queue;

    public QuizGenerationQueue()
    {
        var options = new UnboundedChannelOptions
        {
            SingleReader = true,
            SingleWriter = false
        };
        _queue = Channel.CreateUnbounded<QuizGenerationJob>(options);
    }

    public async ValueTask QueueQuizAsync(QuizGenerationJob job, CancellationToken cancellationToken)
    {
        await _queue.Writer.WriteAsync(job, cancellationToken);
    }

    public async ValueTask<QuizGenerationJob> DequeueAsync(CancellationToken cancellationToken)
    {
        return await _queue.Reader.ReadAsync(cancellationToken);
    }
}
