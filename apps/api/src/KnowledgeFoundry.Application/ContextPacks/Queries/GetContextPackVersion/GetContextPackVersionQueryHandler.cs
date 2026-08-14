using KnowledgeFoundry.Application.Abstractions.Persistence;
using KnowledgeFoundry.Application.Common.Errors;
using KnowledgeFoundry.Application.Common.Results;
using KnowledgeFoundry.Application.ContextPacks.Models;
using MediatR;

namespace KnowledgeFoundry.Application.ContextPacks.Queries.GetContextPackVersion;

public sealed class GetContextPackVersionQueryHandler
    : IRequestHandler<GetContextPackVersionQuery, Result<ContextPackVersionDetailsDto>>
{
    private readonly IContextPackRepository _repository;

    public GetContextPackVersionQueryHandler(IContextPackRepository repository)
    {
        _repository = repository;
    }

    public async Task<Result<ContextPackVersionDetailsDto>> Handle(
        GetContextPackVersionQuery request,
        CancellationToken cancellationToken)
    {
        var version = await _repository.GetVersionAsync(
            request.ContextPackId,
            request.VersionNumber,
            cancellationToken);

        if (version is null)
        {
            return Result<ContextPackVersionDetailsDto>.Failure(ContextPackErrors.NotFound);
        }

        var dto = new ContextPackVersionDetailsDto(
            version.VersionNumber.Value,
            version.Status.ToString(),
            version.CreatedAt,
            version.Sections.Select(s => new ContextSectionDto(
                s.Title,
                s.Content,
                s.Order
            )).OrderBy(s => s.Order).ToList().AsReadOnly()
        );

        return Result<ContextPackVersionDetailsDto>.Success(dto);
    }
}
