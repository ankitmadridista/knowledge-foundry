using KnowledgeFoundry.Domain.Common.Base;
using KnowledgeFoundry.Domain.Common.Exceptions;

namespace KnowledgeFoundry.Domain.Assessments.ValueObjects;

public sealed class OptionText : ValueObject
{
    private OptionText()
    {
        Value = string.Empty;
    }

    public string Value { get; }

    public OptionText(string value)
    {
        if (string.IsNullOrWhiteSpace(value))
            throw new DomainException("Option text cannot be empty or whitespace.");

        Value = value.Trim();
    }

    protected override IEnumerable<object?> GetEqualityComponents()
    {
        yield return Value;
    }

    public override string ToString() => Value;

    public static implicit operator string(OptionText text) => text.Value;
}
