using KnowledgeFoundry.Domain.Common.Base;

namespace KnowledgeFoundry.Domain.PromptTemplates.ValueObjects;

public sealed class TargetModel : ValueObject
{
    private TargetModel()
    {
        Value = string.Empty;
    }

    public string Value { get; }

    public TargetModel(string value)
    {
        if (string.IsNullOrWhiteSpace(value))
            throw new ArgumentException(
                "Target model cannot be empty.",
                nameof(value));

        Value = value.Trim();
    }

    protected override IEnumerable<object?> GetEqualityComponents()
    {
        yield return Value;
    }

    public override string ToString()
        => Value;

    public static implicit operator string(TargetModel model)
        => model.Value;
}
