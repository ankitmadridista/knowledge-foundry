using KnowledgeFoundry.Domain.AiPlatform.Enums;
using KnowledgeFoundry.Domain.PromptTemplates.Enums;
using KnowledgeFoundry.Domain.PromptTemplates.ValueObjects; // To use TargetModel

namespace KnowledgeFoundry.Domain.AiPlatform;

public sealed class AiExecutionLog : Entity
{
    private AiExecutionLog() { } // Required by EF Core

    public AiProvider Provider { get; private set; }

    // Using your existing Value Object!
    public TargetModel Model { get; private set; } = null!;

    public int TokensUsed { get; private set; }
    public long ExecutionTimeMs { get; private set; }

    // Using our new Enum instead of a magic string!
    public ExecutionInitiator Initiator { get; private set; }

    public Guid? PromptTemplateId { get; private set; }

    public DateTime ExecutedAt { get; private set; }

    private AiExecutionLog(
        AiProvider provider,
        TargetModel model,
        int tokensUsed,
        long executionTimeMs,
        ExecutionInitiator initiator,
        Guid? promptTemplateId)
    {
        Provider = provider;
        Model = model ?? throw new ArgumentNullException(nameof(model));

        // Basic validation for primitives
        if (tokensUsed < 0) throw new ArgumentException("Tokens cannot be negative.", nameof(tokensUsed));
        if (executionTimeMs < 0) throw new ArgumentException("Execution time cannot be negative.", nameof(executionTimeMs));

        TokensUsed = tokensUsed;
        ExecutionTimeMs = executionTimeMs;
        Initiator = initiator;
        PromptTemplateId = promptTemplateId;
        ExecutedAt = DateTime.UtcNow;
    }

    public static AiExecutionLog LogExecution(
        AiProvider provider,
        string modelString,
        int tokensUsed,
        long executionTimeMs,
        ExecutionInitiator initiator,
        Guid? promptTemplateId = null)
    {
        return new AiExecutionLog(
            provider,
            new TargetModel(modelString),
            tokensUsed,
            executionTimeMs,
            initiator,
            promptTemplateId);
    }
}
