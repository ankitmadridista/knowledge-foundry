using KnowledgeFoundry.Domain.Common.Base;

namespace KnowledgeFoundry.Domain.Common.ValueObjects;

public sealed class UserId : ValueObject
{
    private UserId()
    {
        Value = string.Empty;
    }

    public string Value { get; }

    public UserId(string value)
    {
        if (string.IsNullOrWhiteSpace(value))
            throw new ArgumentException("User ID cannot be empty.", nameof(value));

        Value = value.Trim();
    }

    protected override IEnumerable<object?> GetEqualityComponents()
    {
        yield return Value;
    }

    public override string ToString()
        => Value;

    public static implicit operator string(UserId id)
        => id.Value;
}
