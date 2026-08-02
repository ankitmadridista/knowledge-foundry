using KnowledgeFoundry.Domain.Common.Events;
using KnowledgeFoundry.Domain.PromptTemplates.ValueObjects;

namespace KnowledgeFoundry.Domain.PromptTemplates.Events;

public sealed class PromptVersionPublishedDomainEvent
    : DomainEvent
{
    public Guid PromptTemplateId { get; }

    public PromptVersionNumber VersionNumber { get; }

    public DateTime PublishedAt { get; }

    public PromptVersionPublishedDomainEvent(
        Guid promptTemplateId,
        PromptVersionNumber versionNumber,
        DateTime publishedAt)
    {
        PromptTemplateId = promptTemplateId;
        VersionNumber = versionNumber;
        PublishedAt = publishedAt;
    }
}
