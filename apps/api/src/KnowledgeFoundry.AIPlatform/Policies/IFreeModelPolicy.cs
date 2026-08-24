using KnowledgeFoundry.AIPlatform.Models;
using KnowledgeFoundry.Domain.PromptTemplates.Enums;

namespace KnowledgeFoundry.AIPlatform.Policies;

internal interface IFreeModelPolicy
{
    AiProvider Provider { get; }

    /// <summary>
    /// Evaluates whether a specific model ID is eligible for free-tier execution.
    /// Must NEVER throw unhandled exceptions. Must return FreeModelResult.Unknown on failure.
    /// </summary>
    Task<FreeModelResult> EvaluateAsync(string modelId, CancellationToken cancellationToken = default);
}
