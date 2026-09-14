using KnowledgeFoundry.Domain.PromptTemplates.Enums;

namespace KnowledgeFoundry.Application.Abstractions.Services;

public record EmbeddingTelemetry(float[] Vector, int TokensUsed, long ExecutionTimeMs);

public interface IEmbeddingService
{
    /// <summary>
    /// Calls the specified AI Provider to convert raw text into a 768-dimensional float array.
    /// </summary>
    Task<EmbeddingTelemetry> GenerateEmbeddingAsync(
        string text,
        AiProvider provider,
        string model,
        CancellationToken cancellationToken = default);
}
