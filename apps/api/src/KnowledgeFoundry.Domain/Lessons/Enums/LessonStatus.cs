namespace KnowledgeFoundry.Domain.Lessons.Enums;

public enum LessonStatus
{
    Drafting = 0,     // Step 1: Writing the initial lesson
    Critiquing = 1,   // Step 2: The Critic is reviewing the draft
    Refining = 2,     // Step 3: The Actor is rewriting based on feedback
    Completed = 3,
    Failed = 4
}
