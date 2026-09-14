using KnowledgeFoundry.Application.Common.Results;
using MediatR;

namespace KnowledgeFoundry.Application.ContextPacks.Queries.GetActiveContextPackPayload;

public sealed record GetActiveContextPackPayloadQuery(
    string Identifier,
    string? SearchQuery = null) : IRequest<Result<string>>;
