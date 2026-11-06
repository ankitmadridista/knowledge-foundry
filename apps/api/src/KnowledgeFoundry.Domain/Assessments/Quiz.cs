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
    public Guid QuizGroupId { get; private set; }
    public int Version { get; private set; }

    public IReadOnlyCollection<Question> Questions => _questions.AsReadOnly();

    private Quiz(
        UserId ownerId,
        Guid lessonId,
        QuizTitle title,
        Guid promptTemplateId,
        Guid? aiExecutionLogId,
        Guid? quizGroupId = null,
        int version = 1)
    {
        OwnerId = ownerId ?? throw new ArgumentNullException(nameof(ownerId));
        LessonId = lessonId;
        Title = title ?? throw new ArgumentNullException(nameof(title));
        PromptTemplateId = promptTemplateId;
        AiExecutionLogId = aiExecutionLogId;

        QuizGroupId = quizGroupId ?? Guid.NewGuid();
        Version = version;

        Status = QuizStatus.Draft;
        IsManuallyEdited = false;
        CreatedAt = DateTime.UtcNow;
    }

    public static Quiz Create(
        string ownerId,
        Guid lessonId,
        string title,
        Guid promptTemplateId,
        Guid? aiExecutionLogId = null,
        Guid? quizGroupId = null,
        int version = 1)
    {
        return new Quiz(
            new UserId(ownerId),
            lessonId,
            new QuizTitle(title),
            promptTemplateId,
            aiExecutionLogId,
            quizGroupId,
            version);
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

    public void Archive()
    {
        if (Status == QuizStatus.Archived)
            return;

        Status = QuizStatus.Archived;
    }

    public Quiz CreateNextVersion()
    {
        if (Status != QuizStatus.Published)
            throw new DomainException("Only a published quiz can be versioned.");

        // 1. Create the clone using the existing lineage
        var newQuiz = new Quiz(
            this.OwnerId,
            this.LessonId,
            this.Title,
            this.PromptTemplateId,
            this.AiExecutionLogId,
            this.QuizGroupId, // CRITICAL: Link to the same historical lineage
            this.Version + 1  // CRITICAL: Increment the version
        )
        {
            // 2. Advance status directly to Review so it skips generation and can be edited
            Status = QuizStatus.Review,
            IsManuallyEdited = this.IsManuallyEdited
        };

        // 3. Deep copy all questions and their options
        foreach (var question in this.Questions)
        {
            var newQuestion = newQuiz.AddQuestion(question.Text, question.Type, question.Explanation);

            // Note: Assuming your Question entity has an AddOption method and Options collection.
            // If the method signature is slightly different, adjust it here.
            foreach (var option in question.Options)
            {
                newQuestion.AddOption(option.Text, option.IsCorrect);
            }
        }

        return newQuiz;
    }
}
