using KnowledgeFoundry.Domain.PromptTemplates.Enums;

namespace KnowledgeFoundry.Application.Common.Models;

public sealed record PromptTemplateDto(
    Guid Id,
    string Identifier,
    string Name,
    string Description,
    PromptPurpose Purpose,
    IReadOnlyCollection<string> Tags
);