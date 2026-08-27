using KnowledgeFoundry.AIPlatform.Models;
using KnowledgeFoundry.Domain.PromptTemplates.Enums;

namespace KnowledgeFoundry.AIPlatform.Policies;

internal interface IFreeModelPolicy
{
    AiProvider Provider { get; }

    /// <summary>
    /// Evaluates whether a specific model ID is eligible for free-tier execution.
    /// </summary>
    /// <param name="isDynamicDiscoveryEnabled">If false, policies should bypass HTTP checks and trust local config.</param>
    Task<FreeModelResult> EvaluateAsync(string modelId, bool isDynamicDiscoveryEnabled, CancellationToken cancellationToken = default);
}
