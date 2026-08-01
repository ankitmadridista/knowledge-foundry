using KnowledgeFoundry.Domain.Common.Base;

namespace KnowledgeFoundry.Domain.PromptTemplates.ValueObjects;

public sealed class PromptTag : ValueObject
{
    private PromptTag()
    {
        Value = string.Empty;
    }
    public string Value { get; }

    public PromptTag(string value)
    {
        if (string.IsNullOrWhiteSpace(value))
        {
            throw new ArgumentException(
                "Prompt tag cannot be empty.",
                nameof(value));
        }

        value = value.Trim();

        if (value.Length > 50)
        {
            throw new ArgumentException(
                "Prompt tag cannot exceed 50 characters.",
                nameof(value));
        }

        Value = value.ToLowerInvariant();
    }

    protected override IEnumerable<object?> GetEqualityComponents()
    {
        yield return Value;
    }

    public override string ToString()
        => Value;

    public static implicit operator string(PromptTag tag)
        => tag.Value;
}
