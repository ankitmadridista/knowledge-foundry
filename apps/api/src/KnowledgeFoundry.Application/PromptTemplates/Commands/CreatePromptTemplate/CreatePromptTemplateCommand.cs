using KnowledgeFoundry.Domain.PromptTemplates.Enums;
using MediatR;

namespace KnowledgeFoundry.Application.PromptTemplates.Commands.CreatePromptTemplate;

public sealed record CreatePromptTemplateCommand(
    string Name,
    string Description,
    PromptPurpose Purpose,
    IReadOnlyCollection<string> Tags
) : IRequest<Guid>;