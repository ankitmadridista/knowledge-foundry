using KnowledgeFoundry.Domain.PromptTemplates.Enums;

namespace KnowledgeFoundry.Application.Common.Models;

public record PromptVersionDetailsDto(
    int VersionNumber,
    PromptStatus Status,
    int Capability,
    DateTime CreatedAt,
    IReadOnlyList<PromptMessageDto> Messages
);
