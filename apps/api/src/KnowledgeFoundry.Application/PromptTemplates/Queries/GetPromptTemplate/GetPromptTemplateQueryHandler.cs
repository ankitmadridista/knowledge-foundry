using KnowledgeFoundry.Application.Common.Models;
using MediatR;

namespace KnowledgeFoundry.Application.PromptTemplates.Queries.GetPromptTemplate;

public sealed class GetPromptTemplateQueryHandler
    : IRequestHandler<GetPromptTemplateQuery, PromptTemplateDto?>
{
    public async Task<PromptTemplateDto?> Handle(
        GetPromptTemplateQuery request,
        CancellationToken cancellationToken)
    {
        await Task.CompletedTask;

        return null;
    }
}