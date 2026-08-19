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
    public AiProvider Provider { get; private set; }
    public TargetModel Model { get; private set; } = null!;

    public IReadOnlyCollection<PromptTemplateVersion> Versions =>
        _versions.AsReadOnly();

    public IReadOnlyCollection<PromptTag> Tags =>
        _tags.AsReadOnly();

    private PromptTemplate(
        PromptIdentifier identifier,
        PromptName name,
        PromptDescription description,
        PromptPurpose purpose,
        AiProvider provider,
        TargetModel model,
        IEnumerable<PromptTag>? tags = null)
    {
        Identifier = identifier ?? throw new ArgumentNullException(nameof(identifier), "Identifier cannot be empty.");
        Name = name ?? throw new ArgumentNullException(nameof(name), "Name cannot be empty.");
        Description = description ?? throw new ArgumentNullException(nameof(description), "Description cannot be empty.");
        Purpose = purpose;
        Provider = provider;
        Model = model ?? throw new ArgumentNullException(nameof(model), "Target model cannot be empty.");

        if (tags is not null)
        {
            _tags.AddRange(tags.Select(tag => new PromptTag(tag)));
        }
    }

    public static PromptTemplate Create(
        string identifier,
        string name,
        string description,
        PromptPurpose purpose,
        AiProvider provider = AiProvider.Groq,
        string model = "llama-3.3-70b-versatile",
        IEnumerable<string>? tags = null)
    {
        return new PromptTemplate(
            new PromptIdentifier(identifier),
            new PromptName(name),
            new PromptDescription(description),
            purpose,
            provider,
            new TargetModel(model),
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
        var version = _versions.SingleOrDefault(v => v.VersionNumber.Value == versionNumber.Value);

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
            activeVersion.VersionNumber.Value != versionNumber.Value)
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
        var version = _versions.Single(v => v.VersionNumber.Value == versionNumber.Value);

        version.Archive();
    }
}
