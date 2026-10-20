using KnowledgeFoundry.Domain.Assessments.Enums;
using KnowledgeFoundry.Domain.Assessments.ValueObjects;

namespace KnowledgeFoundry.Domain.Assessments;

public sealed class Question : Entity
{
    private readonly List<Option> _options = [];

    private Question()
    {
        // Required by EF Core
    }

    public QuestionText Text { get; private set; } = null!;
    public QuestionType Type { get; private set; }
    public string? Explanation { get; private set; }

    public IReadOnlyCollection<Option> Options => _options.AsReadOnly();

    internal Question(QuestionText text, QuestionType type, string? explanation)
    {
        Text = text ?? throw new ArgumentNullException(nameof(text));
        Type = type;
        Explanation = explanation;
    }

    public void UpdateDetails(QuestionText text, QuestionType type, string? explanation)
    {
        Text = text ?? throw new ArgumentNullException(nameof(text));
        Type = type;
        Explanation = explanation;
    }

    public Option AddOption(OptionText text, bool isCorrect)
    {
        var option = new Option(text, isCorrect);
        _options.Add(option);
        return option;
    }

    public void RemoveOption(Guid optionId)
    {
        var option = _options.SingleOrDefault(o => o.Id == optionId);
        if (option is not null)
        {
            _options.Remove(option);
        }
    }
}
