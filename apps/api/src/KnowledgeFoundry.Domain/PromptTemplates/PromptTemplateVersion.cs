using KnowledgeFoundry.Domain.Common.Exceptions;
using KnowledgeFoundry.Domain.PromptTemplates.Enums;
using KnowledgeFoundry.Domain.PromptTemplates.ValueObjects;

namespace KnowledgeFoundry.Domain.PromptTemplates;

public sealed class PromptTemplateVersion : Entity
{
    private readonly List<PromptMessage> _messages = new();
    private readonly List<PromptVariable> _variables = new();

    public PromptVersionNumber VersionNumber { get; private set; } = null!;

    public IReadOnlyCollection<PromptMessage> Messages => _messages.AsReadOnly();

    public IReadOnlyCollection<PromptVariable> Variables => _variables.AsReadOnly();

    public PromptCapability Capability { get; private set; }

    public PromptStatus Status { get; private set; }

    public DateTime CreatedAt { get; private set; }

    public DateTime? PublishedAt { get; private set; }

    public DateTime? ActivatedAt { get; private set; }
    public DateTime? ArchivedAt { get; private set; }
    public DateTime? DeprecatedAt { get; private set; }

    private PromptTemplateVersion()
    {
    }

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

    private void ExtractVariables()
    {
        _variables.Clear();
        var uniqueVariableNames = new HashSet<string>();

        // Regex to find {VariableName}. Matches letters, numbers, and underscores.
        var regex = new System.Text.RegularExpressions.Regex(@"\{([a-zA-Z0-9_]+)\}");

        foreach (var message in _messages)
        {
            var matches = regex.Matches(message.Content);
            foreach (System.Text.RegularExpressions.Match match in matches)
            {
                var variableName = match.Groups[1].Value;
                uniqueVariableNames.Add(variableName);
            }
        }

        foreach (var name in uniqueVariableNames)
        {
            _variables.Add(new PromptVariable(name));
        }
    }

    internal static PromptTemplateVersion Create(
        PromptVersionNumber versionNumber,
        IEnumerable<PromptMessage> messages,
        PromptCapability capability)
    {
        var version = new PromptTemplateVersion(versionNumber, messages, capability);

        // Extract variables from the messages we just added!
        version.ExtractVariables();

        return version;
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
