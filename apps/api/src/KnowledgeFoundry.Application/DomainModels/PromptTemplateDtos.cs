using KnowledgeFoundry.Domain.PromptTemplates.Enums;

namespace KnowledgeFoundry.Application.DomainModels;

public record PromptVersionDto(
    int VersionNumber,
    string Status,
    int Capability,
    DateTime CreatedAt
);

public sealed record PromptTemplateDtos(
    Guid Id,
    string Identifier,
    string Name,
    string Description,
    PromptPurpose Purpose,
    AiProvider Provider,
    string Model,
    IReadOnlyCollection<string> Tags,
    List<PromptVersionDto> Versions
);
public record PromptVersionDetailsDto(
    int VersionNumber,
    PromptStatus Status,
    int Capability,
    DateTime CreatedAt,
    IReadOnlyList<PromptMessageDto> Messages
);

public record PromptMessageDto(
    PromptMessageRole Role,
    string Content,
    int Order);

public record MessagePayloadDto(string Role, string Content);

public record PromptPayloadDto(
    Guid Id,
    string Name,
    string Identifier,
    IEnumerable<MessagePayloadDto> Messages,
    IEnumerable<string> Variables,
    string Capability,
    int versionNumber,
    AiProvider Provider,
    string Model);

public record PromptTemplateSummaryDto(
    Guid Id,
    string Identifier,
    string Name,
    string Description,
    int Purpose,
    int Provider,
    string Model,
    IEnumerable<string> Tags);
