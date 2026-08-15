namespace KnowledgeFoundry.Application.Common.Models;

public sealed record LessonSummaryDto(
    Guid Id,
    string Title,
    string Topic,
    string Audience,
    string Status, // Generating, Completed, Failed
    DateTime CreatedAt,
    DateTime? CompletedAt);

public sealed record LessonDto(
    Guid Id,
    string Title,
    string Topic,
    string Audience,
    string? Content, // The Markdown! Null if still Generating
    string Status,
    string? ErrorMessage,
    Guid PromptTemplateId,
    Guid? ContextPackId,
    DateTime CreatedAt,
    DateTime? CompletedAt);
