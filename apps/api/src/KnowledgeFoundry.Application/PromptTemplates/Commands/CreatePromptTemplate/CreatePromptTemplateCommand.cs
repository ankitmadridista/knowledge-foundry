using KnowledgeFoundry.Application.Common.Results;
using KnowledgeFoundry.Domain.PromptTemplates.Enums;
using MediatR;

namespace KnowledgeFoundry.Application.PromptTemplates.Commands.CreatePromptTemplate;

public sealed record CreatePromptTemplateCommand(
    string Identifier,
    string Name,
    string Description,
    PromptPurpose Purpose,
    AiProvider Provider,
    string Model,
    IReadOnlyCollection<string> Tags
) : IRequest<Result<Guid>>;
