using KnowledgeFoundry.Application.Common.Models;
using MediatR;

namespace KnowledgeFoundry.Application.PromptTemplates.Queries.GetPromptTemplate;

public sealed record GetPromptTemplateQuery(Guid Id)
    : IRequest<PromptTemplateDto?>;
