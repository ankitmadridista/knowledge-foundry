using KnowledgeFoundry.Domain.Common.Exceptions;
using KnowledgeFoundry.Domain.ContextPacks.Enums;
using KnowledgeFoundry.Domain.ContextPacks.ValueObjects;

namespace KnowledgeFoundry.Domain.ContextPacks;

public sealed class ContextPackVersion : Entity
{
    private readonly List<ContextSection> _sections = new();

    public ContextVersionNumber VersionNumber { get; private set; } = null!;

    public IReadOnlyCollection<ContextSection> Sections => _sections.AsReadOnly();

    public ContextPackStatus Status { get; private set; }

    public DateTime CreatedAt { get; private set; }
    public DateTime? PublishedAt { get; private set; }
    public DateTime? ActivatedAt { get; private set; }
    public DateTime? ArchivedAt { get; private set; }
    public DateTime? DeprecatedAt { get; private set; }

    private ContextPackVersion() { } // EF Core

    internal ContextPackVersion(ContextVersionNumber versionNumber, IEnumerable<ContextSection> sections)
    {
        ArgumentNullException.ThrowIfNull(versionNumber);
        ArgumentNullException.ThrowIfNull(sections);

        var sectionList = sections.ToList();
        if (!sectionList.Any())
            throw new DomainException("A context pack version must contain at least one section.");

        VersionNumber = versionNumber;
        _sections.AddRange(sectionList);
        Status = ContextPackStatus.Draft;
        CreatedAt = DateTime.UtcNow;
    }

    internal static ContextPackVersion Create(ContextVersionNumber versionNumber, IEnumerable<ContextSection> sections)
    {
        return new ContextPackVersion(versionNumber, sections);
    }

    internal void Publish()
    {
        if (Status != ContextPackStatus.Draft)
            throw new DomainException("Only draft context packs can be published.");

        Status = ContextPackStatus.Published;
        PublishedAt = DateTime.UtcNow;
    }

    internal void Activate()
    {
        Status = ContextPackStatus.Active;
        ActivatedAt = DateTime.UtcNow;
    }

    internal void Archive()
    {
        Status = ContextPackStatus.Archived;
        ArchivedAt = DateTime.UtcNow;
    }

    internal void Deprecate()
    {
        Status = ContextPackStatus.Deprecated;
        DeprecatedAt = DateTime.UtcNow;
    }
}
