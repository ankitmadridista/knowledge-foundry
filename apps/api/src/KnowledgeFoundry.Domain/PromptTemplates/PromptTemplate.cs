using KnowledgeFoundry.Domain.Common.Base;
using KnowledgeFoundry.Domain.PromptTemplates.Enums;
using KnowledgeFoundry.Domain.PromptTemplates.ValueObjects;

namespace KnowledgeFoundry.Domain.PromptTemplates;

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


    public PromptTemplate(
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
}
