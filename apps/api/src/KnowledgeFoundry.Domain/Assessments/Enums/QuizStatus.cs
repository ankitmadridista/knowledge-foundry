namespace KnowledgeFoundry.Domain.Assessments.Enums;

public enum QuizStatus
{
    Draft = 0,      // Waiting for AI generation
    Review = 1,     // AI generation complete, waiting for human audit
    Published = 2,  // Human audited and approved, ready for use
    Failed = 3      // AI generation failed
}
