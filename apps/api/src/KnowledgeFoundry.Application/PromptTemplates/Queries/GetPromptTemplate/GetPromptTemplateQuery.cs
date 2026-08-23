using KnowledgeFoundry.Application.Common.Results;
using KnowledgeFoundry.Application.DomainModels;
using MediatR;

namespace KnowledgeFoundry.Application.PromptTemplates.Queries.GetPromptTemplate;

public sealed record GetPromptTemplateQuery(Guid Id)
    : IRequest<Result<PromptTemplateDtos>>;
