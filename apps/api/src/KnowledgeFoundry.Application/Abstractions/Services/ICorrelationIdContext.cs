namespace KnowledgeFoundry.Application.Abstractions.Services;

/// <summary>
/// Provides access to the ambient correlation ID for the current execution flow.
/// </summary>
public interface ICorrelationIdContext
{
    /// <summary>
    /// Gets the current correlation ID.
    /// </summary>
    string CorrelationId { get; }

    /// <summary>
    /// Sets the correlation ID for the current execution context.
    /// </summary>
    /// <param name="correlationId">The validated correlation ID string.</param>
    void SetCorrelationId(string correlationId);
}
