using KnowledgeFoundry.Domain.Common.Events;
using KnowledgeFoundry.Domain.ContextPacks.ValueObjects;

namespace KnowledgeFoundry.Domain.ContextPacks.Events
{
    public sealed class ContextPackVersionPublishedDomainEvent : DomainEvent
    {
        public Guid ContextPackId { get; }

        public ContextVersionNumber VersionNumber { get; }

        public DateTime PublishedAt { get; }

        public ContextPackVersionPublishedDomainEvent(
            Guid contextPackId,
            ContextVersionNumber versionNumber,
            DateTime publishedAt)
        {
            ContextPackId = contextPackId;
            VersionNumber = versionNumber;
            PublishedAt = publishedAt;
        }
    }
}
