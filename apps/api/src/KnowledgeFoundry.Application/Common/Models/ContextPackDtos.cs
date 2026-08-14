namespace KnowledgeFoundry.Application.ContextPacks.Models;

// Existing DTOs...
public sealed record ContextSectionDto(string Title, string Content, int Order);
public sealed record ContextPackVersionDto(int VersionNumber, string Status, DateTime CreatedAt);
public sealed record ContextPackDto(
    Guid Id,
    string Identifier,
    string Name,
    string Description,
    IReadOnlyList<string> Tags,
    IReadOnlyList<ContextPackVersionDto> Versions);

// NEW: For the list page
public sealed record ContextPackSummaryDto(
    Guid Id,
    string Identifier,
    string Name,
    string Description,
    IEnumerable<string> Tags);

// NEW: For viewing a specific version's Markdown sections
public sealed record ContextPackVersionDetailsDto(
    int VersionNumber,
    string Status,
    DateTime CreatedAt,
    IReadOnlyList<ContextSectionDto> Sections);
