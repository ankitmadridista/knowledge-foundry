using KnowledgeFoundry.Domain.PromptTemplates.Enums;

public sealed record LessonSummaryDto(
    Guid Id,
    string Title,
    string Topic,
    string Audience,
    string Status,
    DateTime CreatedAt,
    DateTime? CompletedAt,
    bool IsManuallyEdited,
    string? Model
);

public sealed record LessonDto(
    Guid Id,
    string Title,
    string Topic,
    string Audience,
    string? Content,
    string Status,
    string? ErrorMessage,
    Guid PromptTemplateId,
    Guid? ContextPackId,
    DateTime CreatedAt,
    DateTime? CompletedAt,
    bool IsManuallyEdited,
    AiProvider? Provider,
    string? Model,
    int? TokensUsed,
    long? ExecutionTimeMs
);
