using KnowledgeFoundry.Application.Common.Results;
using MediatR;

namespace KnowledgeFoundry.Application.ContextPacks.Queries.GetActiveContextPackPayload;

// Returns a single formatted Markdown string containing all sections
public sealed record GetActiveContextPackPayloadQuery(string Identifier) : IRequest<Result<string>>;
