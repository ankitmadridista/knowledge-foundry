using KnowledgeFoundry.Application.Abstractions.Persistence;
using KnowledgeFoundry.Application.Common.Results;
using KnowledgeFoundry.Application.ContextPacks.Models;
using MediatR;

namespace KnowledgeFoundry.Application.ContextPacks.Queries.GetContextPacks;

public sealed class GetContextPacksQueryHandler
    : IRequestHandler<GetContextPacksQuery, Result<IReadOnlyList<ContextPackSummaryDto>>>
{
    private readonly IContextPackRepository _repository;

    public GetContextPacksQueryHandler(IContextPackRepository repository)
    {
        _repository = repository;
    }

    public async Task<Result<IReadOnlyList<ContextPackSummaryDto>>> Handle(
        GetContextPacksQuery request,
        CancellationToken cancellationToken)
    {
        var packs = await _repository.GetAllAsync(cancellationToken);

        var dtos = packs.Select(p => new ContextPackSummaryDto(
            p.Id,
            p.Identifier.Value,
            p.Name.Value,
            p.Description.Value,
            p.Tags.Select(tag => tag.Value)
        )).ToList();

        return Result<IReadOnlyList<ContextPackSummaryDto>>.Success(dtos);
    }
}
