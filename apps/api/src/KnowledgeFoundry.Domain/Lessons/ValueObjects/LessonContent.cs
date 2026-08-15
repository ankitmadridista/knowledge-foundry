using KnowledgeFoundry.Domain.Common.Base;

namespace KnowledgeFoundry.Domain.Lessons.ValueObjects;

public sealed class LessonContent : ValueObject
{
    private LessonContent() { }

    public string Value { get; }

    public LessonContent(string value)
    {
        if (string.IsNullOrWhiteSpace(value))
            throw new ArgumentException("Lesson content cannot be empty.", nameof(value));

        // Business Rule: AI responses should not exceed ~15,000 words to prevent DB bloat
        if (value.Length > 100000)
            throw new ArgumentException("Lesson content is too large. Maximum size is 100,000 characters.", nameof(value));

        Value = value.Trim();
    }

    protected override IEnumerable<object?> GetEqualityComponents()
    {
        yield return Value;
    }

    public override string ToString() => Value;

    public static implicit operator string(LessonContent content) => content.Value;
}
