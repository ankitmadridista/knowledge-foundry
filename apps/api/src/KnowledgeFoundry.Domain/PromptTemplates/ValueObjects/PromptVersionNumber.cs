using KnowledgeFoundry.Domain.Common.Base;

namespace KnowledgeFoundry.Domain.PromptTemplates.ValueObjects;

public sealed class PromptVersionNumber : ValueObject
{
    public int Value { get; }

    public PromptVersionNumber(int value)
    {
        if (value <= 0)
        {
            throw new ArgumentOutOfRangeException(
                nameof(value),
                "Version number must be greater than zero.");
        }

        Value = value;
    }

    public PromptVersionNumber Next()
        => new(Value + 1);

    protected override IEnumerable<object?> GetEqualityComponents()
    {
        yield return Value;
    }

    public override string ToString()
        => $"v{Value}";

    public static implicit operator int(PromptVersionNumber version)
        => version.Value;
}
