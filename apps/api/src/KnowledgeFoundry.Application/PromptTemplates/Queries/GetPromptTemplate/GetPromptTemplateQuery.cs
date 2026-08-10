using KnowledgeFoundry.Application.Common.Models;
using KnowledgeFoundry.Application.Common.Results;
using MediatR;

namespace KnowledgeFoundry.Application.PromptTemplates.Queries.GetPromptTemplate;

public sealed record GetPromptTemplateQuery(Guid Id)
    : IRequest<Result<PromptTemplateDto>>;
