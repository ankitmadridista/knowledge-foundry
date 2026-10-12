using KnowledgeFoundry.Domain.Common.Base;
using KnowledgeFoundry.Domain.Common.Exceptions;

namespace KnowledgeFoundry.Domain.Assessments.ValueObjects;

public sealed class QuestionText : ValueObject
{
    private QuestionText()
    {
        Value = string.Empty;
    }

    public string Value { get; }

    public QuestionText(string value)
    {
        if (string.IsNullOrWhiteSpace(value))
            throw new DomainException("Question text cannot be empty or whitespace.");

        Value = value.Trim();
    }

    protected override IEnumerable<object?> GetEqualityComponents()
    {
        yield return Value;
    }

    public override string ToString() => Value;

    public static implicit operator string(QuestionText text) => text.Value;
}
