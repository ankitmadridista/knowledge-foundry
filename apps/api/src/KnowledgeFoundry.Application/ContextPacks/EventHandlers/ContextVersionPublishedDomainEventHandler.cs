using KnowledgeFoundry.Application.BackgroundProcessing;
using KnowledgeFoundry.Domain.ContextPacks.Events;
using KnowledgeFoundry.Domain.PromptTemplates.Enums;
using MediatR;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace KnowledgeFoundry.Application.ContextPacks.EventHandlers;

internal sealed class ContextVersionPublishedDomainEventHandler
    : INotificationHandler<ContextPackVersionPublishedDomainEvent>
{
    private readonly IContextIngestionQueue _queue;
    private readonly IConfiguration _configuration;
    private readonly ILogger<ContextVersionPublishedDomainEventHandler> _logger;

    public ContextVersionPublishedDomainEventHandler(
        IContextIngestionQueue queue,
        IConfiguration configuration,
        ILogger<ContextVersionPublishedDomainEventHandler> logger)
    {
        _queue = queue;
        _configuration = configuration;
        _logger = logger;
    }

    public async Task Handle(
        ContextPackVersionPublishedDomainEvent notification,
        CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "✅ DOMAIN EVENT FIRED: Context Pack {ContextPackId} published Version {VersionNumber} at {Time}",
            notification.ContextPackId,
            notification.VersionNumber.Value,
            notification.PublishedAt);

        // 1. Determine which AI provider/model to use for embeddings
        //    Reads from appsettings.json, defaulting to Gemini's free tier if not found.
        var providerString = _configuration["Embeddings:DefaultProvider"] ?? "Gemini";
        var model = _configuration["Embeddings:DefaultModel"] ?? "text-embedding-004";

        if (!Enum.TryParse<AiProvider>(providerString, true, out var provider))
        {
            provider = AiProvider.Gemini;
        }

        // 2. Queue the background ingestion job
        var job = new ContextIngestionJob(
            notification.ContextPackId,
            notification.VersionNumber.Value,
            provider,
            model);

        await _queue.QueueJobAsync(job, cancellationToken);

        _logger.LogInformation("🚀 Queued background vector ingestion job for Context Pack {ContextPackId}", notification.ContextPackId);
    }
}
