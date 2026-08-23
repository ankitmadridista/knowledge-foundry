using KnowledgeFoundry.Application.Common.Results;
using MediatR;

namespace KnowledgeFoundry.Application.ContextPacks.Queries.GetActiveContextPackPayload;

public sealed record GetActiveContextPackPayloadQuery(string Identifier) : IRequest<Result<string>>;
