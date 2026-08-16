using KnowledgeFoundry.Domain.Common.Base;

namespace KnowledgeFoundry.Domain.Lessons.ValueObjects;

public sealed class LessonAudience : ValueObject
{
    private LessonAudience()
    {
            
    }
    public string Value { get; }

    public LessonAudience(string value)
    {
        if (string.IsNullOrWhiteSpace(value))
            throw new ArgumentException("Audience level cannot be empty.", nameof(value));

        if (value.Length > 100)
            throw new ArgumentException("Audience level cannot exceed 100 characters.", nameof(value));

        Value = value.Trim();
    }

    protected override IEnumerable<object?> GetEqualityComponents()
    {
        yield return Value;
    }

    public override string ToString()
        => Value;

    public static implicit operator string(LessonAudience audience)
        => audience.Value;
}
