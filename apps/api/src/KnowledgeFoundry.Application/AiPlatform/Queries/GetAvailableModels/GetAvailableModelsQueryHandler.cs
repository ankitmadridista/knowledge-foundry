using KnowledgeFoundry.Application.Abstractions.Services;
using KnowledgeFoundry.Application.Common.Models;
using KnowledgeFoundry.Application.Common.Results;
using MediatR;

namespace KnowledgeFoundry.Application.AiPlatform.Queries.GetAvailableModels;

public sealed class GetAvailableModelsQueryHandler
    : IRequestHandler<GetAvailableModelsQuery, Result<List<AiModelDto>>>
{
    private readonly IAiModelDiscoveryService _modelDiscoveryService;

    public GetAvailableModelsQueryHandler(IAiModelDiscoveryService modelDiscoveryService)
    {
        _modelDiscoveryService = modelDiscoveryService;
    }

    public async Task<Result<List<AiModelDto>>> Handle(
        GetAvailableModelsQuery request,
        CancellationToken cancellationToken)
    {
        var models = await _modelDiscoveryService.GetAvailableModelsAsync(cancellationToken);

        return Result<List<AiModelDto>>.Success(models);
    }
}
