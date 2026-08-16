using KnowledgeFoundry.Application.Common.Results;

namespace KnowledgeFoundry.Application.Common.Errors;

public static class LessonErrors
{
    // --- Query Errors ---
    public static readonly Error NotFound =
        new(
            "Lesson.NotFound",
            "The requested lesson was not found.");

    // --- Command Errors (Generation) ---
    public static readonly Error TemplateNotFound =
        new(
            "Lesson.TemplateNotFound",
            "The selected prompt template was not found.");

    public static readonly Error NoActiveTemplate =
        new(
            "Lesson.NoActiveTemplate",
            "The selected prompt template has no active version.");

    public static readonly Error ContextPackNotFound =
        new(
            "Lesson.ContextPackNotFound",
            "The selected context pack was not found.");

    public static readonly Error GenerationFailed =
        new(
            "Lesson.GenerationFailed",
            "The AI platform failed to generate the lesson content.");

    // --- Command Errors (Mutation) ---
    public static readonly Error NotCompleted =
        new(
            "Lesson.NotCompleted",
            "Only completed lessons can be edited.");
}
