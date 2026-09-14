using KnowledgeFoundry.Application.Abstractions.Persistence;
using KnowledgeFoundry.Application.Abstractions.Services;
using KnowledgeFoundry.Application.BackgroundProcessing;
using KnowledgeFoundry.Domain.ContextPacks;
using KnowledgeFoundry.Domain.ContextPacks.ValueObjects;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace KnowledgeFoundry.Infrastructure.BackgroundProcessing;

public sealed class ContextIngestionWorker : BackgroundService
{
    private readonly IContextIngestionQueue _queue;
    private readonly IServiceScopeFactory _scopeFactory;
    private readonly ILogger<ContextIngestionWorker> _logger;

    public ContextIngestionWorker(
        IContextIngestionQueue queue,
        IServiceScopeFactory scopeFactory,
        ILogger<ContextIngestionWorker> logger)
    {
        _queue = queue;
        _scopeFactory = scopeFactory;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("Context Ingestion Worker is starting.");

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                var job = await _queue.DequeueJobAsync(stoppingToken);
                await ProcessIngestionJobAsync(job, stoppingToken);
            }
            catch (OperationCanceledException)
            {
                // Prevent throwing if application is shutting down gracefully
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "A fatal error occurred in the Context Ingestion Worker loop.");
            }
        }
    }

    private async Task ProcessIngestionJobAsync(ContextIngestionJob job, CancellationToken stoppingToken)
    {
        _logger.LogInformation("Starting ingestion for ContextPack {Id} Version {Version}", job.ContextPackId, job.VersionNumber);

        // Create a new DI scope for our DB context and services
        using var scope = _scopeFactory.CreateScope();

        var contextPackRepo = scope.ServiceProvider.GetRequiredService<IContextPackRepository>();
        var embeddingService = scope.ServiceProvider.GetRequiredService<IEmbeddingService>();
        var unitOfWork = scope.ServiceProvider.GetRequiredService<IUnitOfWork>();

        var contextPack = await contextPackRepo.GetByIdAsync(job.ContextPackId, stoppingToken);
        if (contextPack is null)
        {
            _logger.LogWarning("ContextPack {Id} not found during ingestion.", job.ContextPackId);
            return;
        }

        var targetVersionNumber = new ContextVersionNumber(job.VersionNumber);
        var version = contextPack.Versions.SingleOrDefault(v => v.VersionNumber.Value == targetVersionNumber.Value);

        if (version is null)
        {
            _logger.LogWarning("Version {Version} not found in ContextPack {Id}.", job.VersionNumber, job.ContextPackId);
            return;
        }

        var chunksToAttach = new List<ContextChunk>();
        int globalChunkOrderIndex = 0;

        foreach (var section in version.Sections)
        {
            // 1. Slice the text into overlapping semantic windows
            var textSlices = ChunkText(section.Content, maxCharacters: 1200, overlap: 200);

            foreach (var slice in textSlices)
            {
                // 2. Call the AI to generate the 768-dimension embedding
                var telemetry = await embeddingService.GenerateEmbeddingAsync(
                    slice,
                    job.Provider,
                    job.Model,
                    stoppingToken);

                // 3. Create the Domain Entity
                var chunk = ContextChunk.Create(
                    section.Title,
                    slice,
                    telemetry.Vector,
                    telemetry.TokensUsed,
                    globalChunkOrderIndex++);

                chunksToAttach.Add(chunk);

                // Polite delay to avoid hammering free-tier AI endpoints
                await Task.Delay(1000, stoppingToken);
            }
        }

        // 4. Attach chunks to aggregate and save to Postgres
        contextPack.AttachChunksToVersion(targetVersionNumber, chunksToAttach);

        await unitOfWork.SaveChangesAsync(stoppingToken);

        _logger.LogInformation("Successfully ingested {ChunkCount} chunks for ContextPack {Id} Version {Version}", chunksToAttach.Count, job.ContextPackId, job.VersionNumber);
    }

    /// <summary>
    /// A simple sliding-window text chunker. 
    /// Ensures we don't cut off context abruptly by allowing a small overlap between chunks.
    /// </summary>
    private static List<string> ChunkText(string text, int maxCharacters, int overlap)
    {
        if (string.IsNullOrWhiteSpace(text)) return new List<string>();

        var chunks = new List<string>();
        int i = 0;

        while (i < text.Length)
        {
            int length = Math.Min(maxCharacters, text.Length - i);
            chunks.Add(text.Substring(i, length));

            // Advance by the chunk size MINUS the overlap to create a sliding window
            i += (maxCharacters - overlap);
        }

        return chunks;
    }
}
