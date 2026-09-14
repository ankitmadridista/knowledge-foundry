namespace KnowledgeFoundry.Application.Abstractions.Services;

public interface IContextRetrievalService
{
    /// <summary>
    /// Retrieves context by Aggregate Root ID (Used by Background Workers)
    /// </summary>
    Task<string> GetContextByIdAsync(Guid contextPackId, string searchQuery, CancellationToken cancellationToken = default);

    /// <summary>
    /// Retrieves context by string Identifier (Used by Sandbox/Prompt Execution)
    /// </summary>
    Task<string> GetContextByIdentifierAsync(string identifier, string searchQuery, CancellationToken cancellationToken = default);
}
