using KnowledgeFoundry.Domain.PromptTemplates.Enums;
using KnowledgeFoundry.Domain.PromptTemplates.ValueObjects;

namespace KnowledgeFoundry.Domain.Lessons;

public sealed class LessonEvaluation : Entity
{
    private LessonEvaluation()
    {
        // Parameterless constructor required by EF Core
    }

    public Guid LessonId { get; private set; }
    public Guid EvaluatorPromptTemplateId { get; private set; }

    // We store the structured JSON string directly. 
    // This allows limitless rubric flexibility without altering database columns.
    public string ScorecardJson { get; private set; } = null!;

    // Telemetry and auditing
    public AiProvider Provider { get; private set; }
    public TargetModel Model { get; private set; } = null!;
    public Guid AiExecutionLogId { get; private set; }

    public DateTime EvaluatedAt { get; private set; }

    private LessonEvaluation(
        Guid lessonId,
        Guid evaluatorPromptTemplateId,
        string scorecardJson,
        AiProvider provider,
        TargetModel model,
        Guid aiExecutionLogId)
    {
        LessonId = lessonId;
        EvaluatorPromptTemplateId = evaluatorPromptTemplateId;
        ScorecardJson = scorecardJson ?? throw new ArgumentNullException(nameof(scorecardJson));
        Provider = provider;
        Model = model ?? throw new ArgumentNullException(nameof(model));
        AiExecutionLogId = aiExecutionLogId;
        EvaluatedAt = DateTime.UtcNow;
    }

    public static LessonEvaluation Create(
        Guid lessonId,
        Guid evaluatorPromptTemplateId,
        string scorecardJson,
        AiProvider provider,
        string model,
        Guid aiExecutionLogId)
    {
        return new LessonEvaluation(
            lessonId,
            evaluatorPromptTemplateId,
            scorecardJson,
            provider,
            new TargetModel(model),
            aiExecutionLogId);
    }
}
