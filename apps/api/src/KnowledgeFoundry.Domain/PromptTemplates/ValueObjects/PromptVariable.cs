using KnowledgeFoundry.Domain.Common.Base;

namespace KnowledgeFoundry.Domain.PromptTemplates.ValueObjects;

public sealed class PromptVariable : ValueObject
{
    public string Name { get; }

    // We can expand this later with IsRequired, DefaultValue, etc.
    public PromptVariable(string name)
    {
        Name = name;
    }

    protected override IEnumerable<object> GetEqualityComponents()
    {
        yield return Name;
    }
}
