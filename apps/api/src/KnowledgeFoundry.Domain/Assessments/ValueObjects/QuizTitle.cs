using KnowledgeFoundry.Domain.Common.Base;
using KnowledgeFoundry.Domain.Common.Exceptions;

namespace KnowledgeFoundry.Domain.Assessments.ValueObjects;

public sealed class QuizTitle : ValueObject
{
    private QuizTitle()
    {
        Value = string.Empty;
    }

    public string Value { get; }

    public QuizTitle(string value)
    {
        if (string.IsNullOrWhiteSpace(value))
            throw new DomainException("Quiz title cannot be empty or whitespace.");

        if (value.Length > 200)
            throw new DomainException("Quiz title cannot exceed 200 characters.");

        Value = value.Trim();
    }

    protected override IEnumerable<object?> GetEqualityComponents()
    {
        yield return Value;
    }

    public override string ToString() => Value;

    public static implicit operator string(QuizTitle title) => title.Value;
}
