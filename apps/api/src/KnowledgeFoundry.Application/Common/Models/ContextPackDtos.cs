namespace KnowledgeFoundry.Application.ContextPacks.Models;

public sealed record ContextSectionDto(string Title, string Content, int Order);
public sealed record ContextPackVersionDto(int VersionNumber, string Status, DateTime CreatedAt);
public sealed record ContextPackDto(
    Guid Id,
    string Identifier,
    string Name,
    string Description,
    IReadOnlyList<string> Tags,
    IReadOnlyList<ContextPackVersionDto> Versions);

public sealed record ContextPackSummaryDto(
    Guid Id,
    string Identifier,
    string Name,
    string Description,
    IEnumerable<string> Tags);

public sealed record ContextPackVersionDetailsDto(
    int VersionNumber,
    string Status,
    DateTime CreatedAt,
    IReadOnlyList<ContextSectionDto> Sections);
