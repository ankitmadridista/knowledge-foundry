using KnowledgeFoundry.Application.Common.Models;
using KnowledgeFoundry.Application.Common.Results;
using KnowledgeFoundry.Domain.PromptTemplates.Enums;
using MediatR;

namespace KnowledgeFoundry.Application.PromptTemplates.Queries.GetPromptVersion
{

    public sealed record GetPromptVersionQuery(
        Guid TemplateId,
        int VersionNumber
    ) : IRequest<Result<PromptVersionDetailsDto>>;
}
