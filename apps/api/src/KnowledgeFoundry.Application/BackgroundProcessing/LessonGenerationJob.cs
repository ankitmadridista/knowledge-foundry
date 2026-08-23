namespace KnowledgeFoundry.Application.BackgroundProcessing;

public sealed record LessonGenerationJob(
    Guid LessonId,
    Guid PromptTemplateId,
    Guid? ContextPackId,
    Guid? CriticPromptTemplateId,
    string Topic,
    string Audience,
    int? DraftProviderId,
    string? DraftModel,
    int? CriticProviderId,
    string? CriticModel);
