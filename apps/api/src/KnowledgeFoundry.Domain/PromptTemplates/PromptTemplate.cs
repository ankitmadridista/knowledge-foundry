using KnowledgeFoundry.Domain.Common.Base;
using KnowledgeFoundry.Domain.Common.Exceptions;
using KnowledgeFoundry.Domain.PromptTemplates;
using KnowledgeFoundry.Domain.PromptTemplates.Enums;
using KnowledgeFoundry.Domain.PromptTemplates.ValueObjects;

public sealed class PromptTemplate : Entity
{
    private readonly List<PromptTemplateVersion> _versions = new();
    private readonly List<string> _tags = new();

    public string Identifier { get; private set; }
    public string Name { get; private set; }
    public string Description { get; private set; }
    public PromptPurpose Purpose { get; private set; }

    public IReadOnlyCollection<PromptTemplateVersion> Versions =>
        _versions.AsReadOnly();

    public IReadOnlyCollection<string> Tags =>
        _tags.AsReadOnly();

    private PromptTemplate(
        string identifier,
        string name,
        string description,
        PromptPurpose purpose,
        IEnumerable<string>? tags = null)
    {
        if (string.IsNullOrWhiteSpace(identifier))
            throw new ArgumentException(
                "Identifier cannot be empty.",
                nameof(identifier));

        if (string.IsNullOrWhiteSpace(name))
            throw new ArgumentException(
                "Name cannot be empty.",
                nameof(name));

        Identifier = identifier;
        Name = name;
        Description = description;
        Purpose = purpose;

        if (tags != null)
        {
            _tags.AddRange(tags);
        }
    }

    public static PromptTemplate Create(
        string identifier,
        string name,
        string description,
        PromptPurpose purpose,
        IEnumerable<string>? tags = null)
    {
        return new PromptTemplate(
            identifier,
            name,
            description,
            purpose,
            tags);
    }

    public PromptTemplateVersion CreateVersion(
    IEnumerable<PromptMessage> messages,
    PromptCapability capability)
    {
        var versionNumber = _versions.Count == 0
            ? new PromptVersionNumber(1)
            : _versions.Last().VersionNumber.Next();

        var version = PromptTemplateVersion.Create(
            versionNumber,
            messages,
            capability);

        _versions.Add(version);

        return version;
    }
    private PromptTemplateVersion GetVersion(PromptVersionNumber versionNumber)
    {
        var version = _versions.SingleOrDefault(v => v.VersionNumber == versionNumber);

        if (version is null)
            throw new InvalidOperationException(
                $"Version '{versionNumber}' does not exist.");

        return version;
    }


    public void PublishVersion(PromptVersionNumber versionNumber)
    {
        var version = GetVersion(versionNumber);

        if (version.Status == PromptStatus.Archived)
            throw new InvalidOperationException(
                "Archived versions cannot be published.");

        if (version.Status == PromptStatus.Published)
            throw new DomainException(
                "Version is already published.");

        version.Publish();
    }

    public void ActivateVersion(PromptVersionNumber versionNumber)
    {
        var version = GetVersion(versionNumber);

        if (version.Status != PromptStatus.Published)
            throw new DomainException(
                "Only published versions can be activated.");

        var activeVersion = _versions
        .SingleOrDefault(v => v.Status == PromptStatus.Active);

        if (activeVersion != null &&
        activeVersion.VersionNumber != versionNumber)
        {
            activeVersion.Deprecate();
        }

        version.Activate();
    }


    public void RollbackTo(PromptVersionNumber versionNumber)
    {
        ActivateVersion(versionNumber);
    }

    public void ArchiveVersion(PromptVersionNumber versionNumber)
    {
        var version = _versions.Single(v => v.VersionNumber == versionNumber);

        version.Archive();
    }
}
