using KnowledgeFoundry.Domain.Common.Base;
using KnowledgeFoundry.Domain.PromptTemplates.Enums;
using KnowledgeFoundry.Domain.PromptTemplates.ValueObjects;

namespace KnowledgeFoundry.Domain.PromptTemplates;

public sealed class PromptTemplateVersion : Entity
{
    private readonly List<PromptMessage> _messages = new();

    public int VersionNumber { get; private set; }

    public IReadOnlyCollection<PromptMessage> Messages => _messages.AsReadOnly();

    public PromptCapability Capability { get; private set; }

    public PromptStatus Status { get; private set; }

    public DateTime CreatedAt { get; private set; }

    public DateTime? PublishedAt { get; private set; }

    public DateTime? ActivatedAt { get; private set; }


    public PromptTemplateVersion(
        int versionNumber,
        IEnumerable<PromptMessage> messages,
        PromptCapability capability)
    {
        if (versionNumber <= 0)
        {
            throw new ArgumentOutOfRangeException(
                nameof(versionNumber),
                "Version number must be greater than zero.");
        }

        ArgumentNullException.ThrowIfNull(messages);

        var messageList = messages.ToList();

        if (!messageList.Any())
        {
            throw new ArgumentException(
                "A prompt version must contain at least one message.",
                nameof(messages));
        }

        VersionNumber = versionNumber;

        _messages.AddRange(messageList);

        Capability = capability;

        Status = PromptStatus.Draft;

        CreatedAt = DateTime.UtcNow;
    }


    // Future behavior will be added here:
    //
    // Publish()
    // Activate()
    // Archive()
}
