using KnowledgeFoundry.Domain.Common.Base;
using KnowledgeFoundry.Domain.Common.Exceptions;
using KnowledgeFoundry.Domain.PromptTemplates.Enums;
using KnowledgeFoundry.Domain.PromptTemplates.ValueObjects;

namespace KnowledgeFoundry.Domain.PromptTemplates;

public sealed class PromptTemplateVersion : Entity
{
    private readonly List<PromptMessage> _messages = new();

    public PromptVersionNumber VersionNumber { get; }

    public IReadOnlyCollection<PromptMessage> Messages => _messages.AsReadOnly();

    public PromptCapability Capability { get; private set; }

    public PromptStatus Status { get; private set; }

    public DateTime CreatedAt { get; private set; }

    public DateTime? PublishedAt { get; private set; }

    public DateTime? ActivatedAt { get; private set; }
    public DateTime? ArchivedAt { get; private set; }
    public DateTime? DeprecatedAt { get; private set; }


    private PromptTemplateVersion(
        PromptVersionNumber versionNumber,
        IEnumerable<PromptMessage> messages,
        PromptCapability capability)
    {
        ArgumentNullException.ThrowIfNull(versionNumber);
        ArgumentNullException.ThrowIfNull(messages);

        var messageList = messages.ToList();

        if (!messageList.Any())
        {
            throw new DomainException(
                "A prompt version must contain at least one message.");
        }

        VersionNumber = versionNumber;

        _messages.AddRange(messageList);

        Capability = capability;

        Status = PromptStatus.Draft;

        CreatedAt = DateTime.UtcNow;
    }

    internal static PromptTemplateVersion Create(
    PromptVersionNumber versionNumber,
    IEnumerable<PromptMessage> messages,
    PromptCapability capability)
    {
        return new PromptTemplateVersion(
            versionNumber,
            messages,
            capability
            );
    }

    internal void Publish()
    {
        if (Status != PromptStatus.Draft)
            throw new DomainException(
                "Only draft versions can be published.");

        Status = PromptStatus.Published;
        PublishedAt = DateTime.UtcNow;
    }

    internal void Activate()
    {
        Status = PromptStatus.Active;
        ActivatedAt = DateTime.UtcNow;
    }

    internal void Archive()
    {
        Status = PromptStatus.Archived;
        ArchivedAt = DateTime.UtcNow;
    }
    internal void Deprecate()
    {
        Status = PromptStatus.Deprecated;
        DeprecatedAt = DateTime.UtcNow;
    }

}
