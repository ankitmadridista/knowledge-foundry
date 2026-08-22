using KnowledgeFoundry.Domain.Common.Base;

namespace KnowledgeFoundry.Domain.Lessons.ValueObjects;

public sealed class CritiqueNotes : ValueObject
{
    private CritiqueNotes() { }

    public string Value { get; }

    public CritiqueNotes(string value)
    {
        if (string.IsNullOrWhiteSpace(value))
            throw new ArgumentException("Critique notes cannot be empty.", nameof(value));

        Value = value.Trim();
    }

    protected override IEnumerable<object?> GetEqualityComponents()
    {
        yield return Value;
    }

    public override string ToString() => Value;

    public static implicit operator string(CritiqueNotes notes) => notes.Value;
}
