using KnowledgeFoundry.Domain.Common.Base;

namespace KnowledgeFoundry.Domain.Lessons.ValueObjects;

public sealed class LessonTitle : ValueObject
{
    private LessonTitle()
    {
        Value = string.Empty;
    }

    public string Value { get; }

    public LessonTitle(string value)
    {
        if (string.IsNullOrWhiteSpace(value))
            throw new ArgumentException("Lesson title cannot be empty.", nameof(value));

        if (value.Length > 200)
            throw new ArgumentException("Lesson title cannot exceed 200 characters.", nameof(value));

        Value = value.Trim();
    }

    protected override IEnumerable<object?> GetEqualityComponents()
    {
        yield return Value;
    }

    public override string ToString()
        => Value;

    public static implicit operator string(LessonTitle title)
        => title.Value;
}
