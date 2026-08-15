using KnowledgeFoundry.Domain.Common.Events;
using KnowledgeFoundry.Domain.ContextPacks.ValueObjects;

namespace KnowledgeFoundry.Domain.ContextPacks.Events
{
    public sealed class ContextPackVersionPublishedDomainEvent : DomainEvent
    {
        public Guid PromptTemplateId { get; }

        public ContextVersionNumber VersionNumber { get; }

        public DateTime PublishedAt { get; }

        public ContextPackVersionPublishedDomainEvent(
            Guid promptTemplateId,
            ContextVersionNumber versionNumber,
            DateTime publishedAt)
        {
            PromptTemplateId = promptTemplateId;
            VersionNumber = versionNumber;
            PublishedAt = publishedAt;
        }
    }
}
