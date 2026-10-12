using KnowledgeFoundry.Domain.Assessments.Enums;
using KnowledgeFoundry.Domain.Assessments.ValueObjects;
using KnowledgeFoundry.Domain.Common.Exceptions;

namespace KnowledgeFoundry.Domain.Assessments;

public sealed class Quiz : Entity
{
    private readonly List<Question> _questions = [];

    private Quiz()
    {
        // Required by EF Core
    }

    public Guid LessonId { get; private set; }
    public QuizTitle Title { get; private set; } = null!;
    public QuizStatus Status { get; private set; }

    public Guid? AiExecutionLogId { get; private set; }
    public DateTime CreatedAt { get; private set; }
    public DateTime? PublishedAt { get; private set; }

    public IReadOnlyCollection<Question> Questions => _questions.AsReadOnly();

    private Quiz(
        Guid lessonId,
        QuizTitle title,
        Guid? aiExecutionLogId)
    {
        LessonId = lessonId;
        Title = title ?? throw new ArgumentNullException(nameof(title));
        AiExecutionLogId = aiExecutionLogId;

        Status = QuizStatus.Draft;
        CreatedAt = DateTime.UtcNow;
    }

    public static Quiz Create(
        Guid lessonId,
        string title,
        Guid? aiExecutionLogId = null)
    {
        return new Quiz(
            lessonId,
            new QuizTitle(title),
            aiExecutionLogId);
    }

    public Question AddQuestion(QuestionText text, QuestionType type, string? explanation)
    {
        if (Status != QuizStatus.Draft)
            throw new DomainException("Cannot add questions to a published quiz.");

        var question = new Question(text, type, explanation);
        _questions.Add(question);
        return question;
    }

    public void RemoveQuestion(Guid questionId)
    {
        if (Status != QuizStatus.Draft)
            throw new DomainException("Cannot remove questions from a published quiz.");

        var question = _questions.SingleOrDefault(q => q.Id == questionId);
        if (question is not null)
        {
            _questions.Remove(question);
        }
    }

    public void Publish()
    {
        if (Status == QuizStatus.Published)
            throw new DomainException("Quiz is already published.");

        if (_questions.Count == 0)
            throw new DomainException("Cannot publish a quiz with no questions.");

        Status = QuizStatus.Published;
        PublishedAt = DateTime.UtcNow;
    }
}
