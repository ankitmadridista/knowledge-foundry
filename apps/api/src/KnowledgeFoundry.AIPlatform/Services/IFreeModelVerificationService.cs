using KnowledgeFoundry.AIPlatform.Models;
using KnowledgeFoundry.Domain.PromptTemplates.Enums;

namespace KnowledgeFoundry.AIPlatform.Services;

public interface IFreeModelVerificationService
{
    /// <summary>
    /// Verifies if a model is strictly authorized for free-tier execution.
    /// Utilizes a short-lived cache to prevent provider API spam.
    /// </summary>
    Task<FreeModelResult> VerifyModelAsync(AiProvider provider, string modelId, CancellationToken cancellationToken = default);
}
