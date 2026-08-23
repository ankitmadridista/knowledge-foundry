using KnowledgeFoundry.Application.Abstractions.Persistence;
using KnowledgeFoundry.Application.Common.Models;
using KnowledgeFoundry.Application.Common.Results;
using KnowledgeFoundry.Application.DomainModels;
using MediatR;

namespace KnowledgeFoundry.Application.ContextPacks.Queries.GetContextPacks;

public sealed class GetContextPacksQueryHandler
    : IRequestHandler<GetContextPacksQuery, Result<PagedResponse<ContextPackSummaryDto>>>
{
    private readonly IContextPackRepository _repository;

    public GetContextPacksQueryHandler(IContextPackRepository repository)
    {
        _repository = repository;
    }

    public async Task<Result<PagedResponse<ContextPackSummaryDto>>> Handle(
        GetContextPacksQuery request,
        CancellationToken cancellationToken)
    {
        var (packs, totalCount) = await _repository.GetPagedAsync(
            request.PageNumber,
            request.PageSize,
            request.SearchTerm,
            cancellationToken);

        var dtos = packs.Select(p => new ContextPackSummaryDto(
            p.Id,
            p.Identifier.Value,
            p.Name.Value,
            p.Description.Value,
            p.Tags.Select(tag => tag.Value)
        )).ToList();

        var response = new PagedResponse<ContextPackSummaryDto>(
            dtos,
            totalCount,
            request.PageNumber,
            request.PageSize);

        return Result<PagedResponse<ContextPackSummaryDto>>.Success(response);
    }
}
