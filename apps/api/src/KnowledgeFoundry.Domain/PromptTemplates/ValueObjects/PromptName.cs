using KnowledgeFoundry.Domain.Common.Base;

namespace KnowledgeFoundry.Domain.PromptTemplates.ValueObjects;

public sealed class PromptName : ValueObject
{
    private PromptName()
    {
        Value = string.Empty;
    }
    public string Value { get; }

    public PromptName(string value)
    {
        if (string.IsNullOrWhiteSpace(value))
            throw new ArgumentException(
                "Prompt name cannot be empty.",
                nameof(value));

        if (value.Length > 200)
            throw new ArgumentException(
                "Prompt name cannot exceed 200 characters.",
                nameof(value));

        Value = value.Trim();
    }

    protected override IEnumerable<object?> GetEqualityComponents()
    {
        yield return Value;
    }

    public override string ToString()
        => Value;

    public static implicit operator string(PromptName name)
        => name.Value;
}
