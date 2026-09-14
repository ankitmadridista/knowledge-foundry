using KnowledgeFoundry.Application.Abstractions.Services;
using KnowledgeFoundry.Application.Common.Errors;
using KnowledgeFoundry.Application.Common.Results;
using MediatR;

namespace KnowledgeFoundry.Application.ContextPacks.Queries.GetActiveContextPackPayload;

public sealed class GetActiveContextPackPayloadQueryHandler
    : IRequestHandler<GetActiveContextPackPayloadQuery, Result<string>>
{
    private readonly IContextRetrievalService _retrievalService;

    public GetActiveContextPackPayloadQueryHandler(
        IContextRetrievalService retrievalService)
    {
        _retrievalService = retrievalService;
    }

    public async Task<Result<string>> Handle(GetActiveContextPackPayloadQuery request, CancellationToken cancellationToken)
    {
        var contextStr = await _retrievalService.GetContextByIdentifierAsync(request.Identifier, request.SearchQuery ?? "", cancellationToken);

        if (string.IsNullOrWhiteSpace(contextStr))
            return Result<string>.Failure(ContextPackErrors.NotFound);

        return Result<string>.Success(contextStr);
    }
}
