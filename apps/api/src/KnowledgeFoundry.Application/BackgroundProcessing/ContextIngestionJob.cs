using KnowledgeFoundry.Domain.PromptTemplates.Enums;

namespace KnowledgeFoundry.Application.BackgroundProcessing
{
    public sealed record ContextIngestionJob(
        Guid ContextPackId,
        int VersionNumber,
        AiProvider Provider,
        string Model);
}
