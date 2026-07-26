using KnowledgeFoundry.Domain.Common.Base;

namespace KnowledgeFoundry.Domain.PromptTemplates.ValueObjects;

public sealed class PromptIdentifier : ValueObject
{
    public string Value { get; }

    public PromptIdentifier(string value)
    {
        if (string.IsNullOrWhiteSpace(value))
            throw new ArgumentException(
                "Prompt identifier cannot be empty.",
                nameof(value));

        Value = value.Trim().ToUpperInvariant();
    }

    protected override IEnumerable<object?> GetEqualityComponents()
    {
        yield return Value;
    }

    public override string ToString()
        => Value;

    public static implicit operator string(PromptIdentifier id)
        => id.Value;
}
