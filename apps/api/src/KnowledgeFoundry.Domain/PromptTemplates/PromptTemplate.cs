using KnowledgeFoundry.Domain.Common.Exceptions;
using KnowledgeFoundry.Domain.PromptTemplates;
using KnowledgeFoundry.Domain.PromptTemplates.Enums;
using KnowledgeFoundry.Domain.PromptTemplates.ValueObjects;
using KnowledgeFoundry.Domain.PromptTemplates.Events;


public sealed class PromptTemplate : Entity
{
    private PromptTemplate()
    {
    }
    private readonly List<PromptTemplateVersion> _versions = new();
    private readonly List<PromptTag> _tags = new();

    public PromptIdentifier Identifier { get; private set; } = null!;
    public PromptName Name { get; private set; } = null!;
    public PromptDescription Description { get; private set; } = null!;
    public PromptPurpose Purpose { get; private set; }

    public IReadOnlyCollection<PromptTemplateVersion> Versions =>
        _versions.AsReadOnly();

    public IReadOnlyCollection<PromptTag> Tags =>
        _tags.AsReadOnly();

    private PromptTemplate(
        PromptIdentifier identifier,
        PromptName name,
        PromptDescription description,
        PromptPurpose purpose,
        IEnumerable<PromptTag>? tags = null)
    {
        Identifier = identifier ?? throw new ArgumentNullException("Identifier cannot be empty.", nameof(identifier));
        Name = name ?? throw new ArgumentNullException("Name cannot be empty.", nameof(name));
        Description = description ?? throw new ArgumentNullException("Description cannot be empty.", nameof(description));
        Purpose = purpose;

        if (tags is not null)
        {
            _tags.AddRange(
                tags.Select(tag => new PromptTag(tag)));
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
            new PromptIdentifier(identifier),
            new PromptName(name),
            new PromptDescription(description),
            purpose,
            tags?.Select(t => new PromptTag(t)));
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

        RaiseDomainEvent(new PromptVersionPublishedDomainEvent(
            Id,
            version.VersionNumber,
            version.PublishedAt!.Value));
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
        throw new NotImplementedException();
    }

    public void ArchiveVersion(PromptVersionNumber versionNumber)
    {
        var version = _versions.Single(v => v.VersionNumber == versionNumber);

        version.Archive();
    }
}
