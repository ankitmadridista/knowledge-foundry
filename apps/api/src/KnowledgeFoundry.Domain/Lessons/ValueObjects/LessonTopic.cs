using KnowledgeFoundry.Domain.Common.Base;

namespace KnowledgeFoundry.Domain.Lessons.ValueObjects;

public sealed class LessonTopic : ValueObject
{
    private LessonTopic() { }

    public string Value { get; }

    public LessonTopic(string value)
    {
        if (string.IsNullOrWhiteSpace(value))
            throw new ArgumentException("Lesson topic cannot be empty.", nameof(value));

        // Fixed: Allow up to 500 characters for descriptive topics
        if (value.Length > 500)
            throw new ArgumentException("Lesson topic cannot exceed 500 characters.", nameof(value));

        Value = value.Trim();
    }

    protected override IEnumerable<object?> GetEqualityComponents()
    {
        yield return Value;
    }

    public override string ToString() => Value;

    public static implicit operator string(LessonTopic topic) => topic.Value;
}
