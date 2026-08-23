using KnowledgeFoundry.Application.Abstractions.Persistence;
using KnowledgeFoundry.Application.Common.Errors;
using KnowledgeFoundry.Application.Common.Results;
using KnowledgeFoundry.Application.DomainModels;
using MediatR;

namespace KnowledgeFoundry.Application.ContextPacks.Queries.GetContextPack;

public sealed class GetContextPackQueryHandler
    : IRequestHandler<GetContextPackQuery, Result<ContextPackDto>>
{
    private readonly IContextPackRepository _repository;

    public GetContextPackQueryHandler(IContextPackRepository repository)
    {
        _repository = repository;
    }

    public async Task<Result<ContextPackDto>> Handle(
        GetContextPackQuery request,
        CancellationToken cancellationToken)
    {
        var pack = await _repository.GetByIdAsync(request.Id, cancellationToken);

        if (pack is null)
        {
            return Result<ContextPackDto>.Failure(ContextPackErrors.NotFound);
        }

        var dto = new ContextPackDto(
            pack.Id,
            pack.Identifier.Value,
            pack.Name.Value,
            pack.Description.Value,
            pack.Tags.Select(t => t.Value).ToList().AsReadOnly(),
            Versions: pack.Versions.Select(v => new ContextPackVersionDto(
                v.VersionNumber.Value,
                v.Status.ToString(),
                v.CreatedAt
            )).ToList());

        return Result<ContextPackDto>.Success(dto);
    }
}
