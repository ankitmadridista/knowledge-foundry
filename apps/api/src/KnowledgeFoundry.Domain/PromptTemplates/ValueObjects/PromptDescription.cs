using KnowledgeFoundry.Domain.Common.Base;

namespace KnowledgeFoundry.Domain.PromptTemplates.ValueObjects;

public sealed class PromptDescription : ValueObject
{
    private PromptDescription()
    {
        Value = string.Empty;
    }
    public string Value { get; }

    public PromptDescription(string value)
    {
        ArgumentNullException.ThrowIfNull(value);

        Value = value.Trim();
    }

    protected override IEnumerable<object?> GetEqualityComponents()
    {
        yield return Value;
    }

    public override string ToString()
        => Value;

    public static implicit operator string(PromptDescription description)
        => description.Value;
}
