using KnowledgeFoundry.Domain.PromptTemplates.Enums;

namespace KnowledgeFoundry.Application.Common.Models;

public record PromptVersionDto(
    int VersionNumber,
    string Status,
    int Capability,
    DateTime CreatedAt
);

public sealed record PromptTemplateDto(
    Guid Id,
    string Identifier,
    string Name,
    string Description,
    PromptPurpose Purpose,
    IReadOnlyCollection<string> Tags,
    List<PromptVersionDto> Versions
);
