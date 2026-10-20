using KnowledgeFoundry.Domain.Assessments.Enums;
using KnowledgeFoundry.Domain.Assessments.ValueObjects;
using KnowledgeFoundry.Domain.Common.Exceptions;
using KnowledgeFoundry.Domain.Common.ValueObjects;

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
    public string? ErrorMessage { get; private set; }
    public bool IsManuallyEdited { get; private set; }
    public UserId OwnerId { get; private set; } = null!;

    // Traceability
    public Guid PromptTemplateId { get; private set; }
    public Guid? AiExecutionLogId { get; private set; }

    public DateTime CreatedAt { get; private set; }
    public DateTime? PublishedAt { get; private set; }

    public IReadOnlyCollection<Question> Questions => _questions.AsReadOnly();

    private Quiz(
        UserId ownerId,
        Guid lessonId,
        QuizTitle title,
        Guid promptTemplateId,
        Guid? aiExecutionLogId)
    {
        OwnerId = ownerId ?? throw new ArgumentNullException(nameof(ownerId));
        LessonId = lessonId;
        Title = title ?? throw new ArgumentNullException(nameof(title));
        PromptTemplateId = promptTemplateId;
        AiExecutionLogId = aiExecutionLogId;

        Status = QuizStatus.Draft;
        IsManuallyEdited = false;
        CreatedAt = DateTime.UtcNow;
    }

    public static Quiz Create(
        string ownerId,
        Guid lessonId,
        string title,
        Guid promptTemplateId,
        Guid? aiExecutionLogId = null)
    {
        return new Quiz(
            new UserId(ownerId),
            lessonId,
            new QuizTitle(title),
            promptTemplateId,
            aiExecutionLogId);
    }

    public Question AddQuestion(QuestionText text, QuestionType type, string? explanation)
    {
        if (Status != QuizStatus.Draft && Status != QuizStatus.Review)
            throw new DomainException("Cannot add questions to a published or failed quiz.");

        var question = new Question(text, type, explanation);
        _questions.Add(question);
        return question;
    }

    public void RemoveQuestion(Guid questionId)
    {
        if (Status != QuizStatus.Draft && Status != QuizStatus.Review)
            throw new DomainException("Cannot remove questions from a published or failed quiz.");

        var question = _questions.SingleOrDefault(q => q.Id == questionId);
        if (question is not null)
        {
            _questions.Remove(question);
        }
    }

    public void UpdateTitle(string newTitle)
    {
        if (Status != QuizStatus.Review)
            throw new DomainException("Only quizzes in review can be edited.");

        Title = new QuizTitle(newTitle);
        IsManuallyEdited = true;
    }

    public void ClearQuestions()
    {
        if (Status != QuizStatus.Review)
            throw new DomainException("Only quizzes in review can be edited.");

        _questions.Clear();
        IsManuallyEdited = true;
    }

    public void MarkAsReadyForReview(Guid aiExecutionLogId)
    {
        if (Status != QuizStatus.Draft)
            throw new DomainException("Only draft quizzes can move to review.");

        AiExecutionLogId = aiExecutionLogId;
        Status = QuizStatus.Review;
    }

    public void MarkAsFailed(string errorReason)
    {
        if (Status == QuizStatus.Published)
            throw new DomainException("Cannot fail a published quiz.");

        ErrorMessage = errorReason;
        Status = QuizStatus.Failed;
    }

    public void Publish()
    {
        if (Status == QuizStatus.Published)
            throw new DomainException("Quiz is already published.");

        if (Status != QuizStatus.Review)
            throw new DomainException("Only quizzes in the Review state can be published.");

        if (_questions.Count == 0)
            throw new DomainException("Cannot publish a quiz with no questions.");

        Status = QuizStatus.Published;
        PublishedAt = DateTime.UtcNow;
    }
}
