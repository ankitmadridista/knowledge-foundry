using KnowledgeFoundry.Application.Common.Results;
using KnowledgeFoundry.Application.DomainModels;
using MediatR;

namespace KnowledgeFoundry.Application.PromptTemplates.Queries.GetActivePromptPayload;

public sealed record GetActivePromptPayloadQuery(string Identifier)
    : IRequest<Result<PromptPayloadDto>>;
