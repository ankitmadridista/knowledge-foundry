using KnowledgeFoundry.Application.Common.Models;

namespace KnowledgeFoundry.Application.Abstractions.Services;

public interface IAiModelDiscoveryService
{
    Task<List<AiModelDto>> GetAvailableModelsAsync(CancellationToken cancellationToken = default);
}
