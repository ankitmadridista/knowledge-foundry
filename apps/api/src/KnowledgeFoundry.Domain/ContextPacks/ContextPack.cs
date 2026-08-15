using KnowledgeFoundry.Domain.Common.Exceptions;
using KnowledgeFoundry.Domain.ContextPacks.Enums;
using KnowledgeFoundry.Domain.ContextPacks.Events;
using KnowledgeFoundry.Domain.ContextPacks.ValueObjects;

namespace KnowledgeFoundry.Domain.ContextPacks;

public sealed class ContextPack : Entity
{
    private readonly List<ContextPackVersion> _versions = new();
    private readonly List<ContextTag> _tags = new();

    public ContextPackIdentifier Identifier { get; private set; } = null!;
    public ContextPackName Name { get; private set; } = null!;
    public ContextPackDescription Description { get; private set; } = null!;

    public IReadOnlyCollection<ContextPackVersion> Versions => _versions.AsReadOnly();
    public IReadOnlyCollection<ContextTag> Tags => _tags.AsReadOnly();

    private ContextPack() { } // EF Core

    private ContextPack(
        ContextPackIdentifier identifier,
        ContextPackName name,
        ContextPackDescription description,
        IEnumerable<ContextTag>? tags = null)
    {
        Identifier = identifier ?? throw new ArgumentNullException(nameof(identifier));
        Name = name ?? throw new ArgumentNullException(nameof(name));
        Description = description ?? throw new ArgumentNullException(nameof(description));

        if (tags is not null)
        {
            _tags.AddRange(tags);
        }
    }

    public static ContextPack Create(
        string identifier,
        string name,
        string description,
        IEnumerable<string>? tags = null)
    {
        return new ContextPack(
            new ContextPackIdentifier(identifier),
            new ContextPackName(name),
            new ContextPackDescription(description),
            tags?.Select(t => new ContextTag(t)));
    }

    public ContextPackVersion CreateVersion(IEnumerable<ContextSection> sections)
    {
        var versionNumber = _versions.Count == 0
            ? new ContextVersionNumber(1)
            : _versions.Last().VersionNumber.Next();

        var version = ContextPackVersion.Create(versionNumber, sections);
        _versions.Add(version);

        return version;
    }

    private ContextPackVersion GetVersion(ContextVersionNumber versionNumber)
    {
        var version = _versions.SingleOrDefault(v => v.VersionNumber.Value == versionNumber.Value);
        if (version is null)
            throw new InvalidOperationException($"Version '{versionNumber.Value}' does not exist.");

        return version;
    }

    public void PublishVersion(ContextVersionNumber versionNumber)
    {
        var version = GetVersion(versionNumber);

        if (version.Status == ContextPackStatus.Archived)
            throw new InvalidOperationException("Archived versions cannot be published.");

        if (version.Status == ContextPackStatus.Published)
            throw new DomainException("Version is already published.");

        version.Publish();

        RaiseDomainEvent(new ContextPackVersionPublishedDomainEvent(
            Id,
            version.VersionNumber,
            version.PublishedAt!.Value));
    }

    public void ActivateVersion(ContextVersionNumber versionNumber)
    {
        var version = GetVersion(versionNumber);

        if (version.Status != ContextPackStatus.Published)
            throw new DomainException("Only published versions can be activated.");

        var activeVersion = _versions.SingleOrDefault(v => v.Status == ContextPackStatus.Active);

        if (activeVersion != null && activeVersion.VersionNumber.Value != versionNumber.Value)
        {
            activeVersion.Deprecate();
        }

        version.Activate();
    }
}
