using KnowledgeFoundry.Application.Abstractions.Services;

namespace KnowledgeFoundry.Infrastructure.CorrelationContext;

internal sealed class CorrelationIdContext : ICorrelationIdContext
{
    private string? _correlationId;

    // If something tries to read the ID before it's explicitly set by our middleware,
    // we fail-safe by generating one rather than returning null.
    public string CorrelationId => _correlationId ??= Guid.NewGuid().ToString();

    public void SetCorrelationId(string correlationId)
    {
        if (string.IsNullOrWhiteSpace(correlationId))
        {
            throw new ArgumentException("Correlation ID cannot be null or empty.", nameof(correlationId));
        }

        _correlationId = correlationId;
    }
}
