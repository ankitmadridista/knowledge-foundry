using KnowledgeFoundry.Domain.PromptTemplates.Enums;

namespace KnowledgeFoundry.Application.DomainModels;

// Summary DTO for paged lists
public sealed record QuizDtos(
    Guid Id,
    Guid LessonId,
    string Title,
    string Status,
    int QuestionCount,
    DateTime CreatedAt,
    DateTime? PublishedAt,
    string? Model
);

// Detailed DTO for single quiz view & auditing
public sealed record QuizDto(
    Guid Id,
    Guid LessonId,
    string Title,
    string Status,
    string? ErrorMessage,
    DateTime CreatedAt,
    DateTime? PublishedAt,
    AiProvider? Provider,
    string? Model,
    int? TokensUsed,
    long? ExecutionTimeMs,
    IReadOnlyCollection<QuestionDto> Questions
);

public sealed record QuestionDto(
    Guid Id,
    string Text,
    string Type,
    string? Explanation,
    IReadOnlyCollection<OptionDto> Options
);

public sealed record OptionDto(
    Guid Id,
    string Text,
    bool IsCorrect
);
