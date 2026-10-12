using KnowledgeFoundry.Domain.Assessments.ValueObjects;

namespace KnowledgeFoundry.Domain.Assessments;

public sealed class Option : Entity
{
    private Option()
    {
        // Required by EF Core
    }

    public OptionText Text { get; private set; } = null!;
    public bool IsCorrect { get; private set; }

    internal Option(OptionText text, bool isCorrect)
    {
        Text = text ?? throw new ArgumentNullException(nameof(text));
        IsCorrect = isCorrect;
    }

    internal void UpdateText(OptionText newText)
    {
        Text = newText ?? throw new ArgumentNullException(nameof(newText));
    }

    internal void SetAsCorrect(bool isCorrect)
    {
        IsCorrect = isCorrect;
    }
}
