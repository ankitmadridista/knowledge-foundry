using KnowledgeFoundry.Application.Abstractions.Persistence;
using KnowledgeFoundry.Application.Abstractions.Services;
using KnowledgeFoundry.Application.BackgroundProcessing;
using KnowledgeFoundry.Application.Common.Results;
using KnowledgeFoundry.Domain.Assessments;
using KnowledgeFoundry.Domain.Lessons.Enums;
using KnowledgeFoundry.Domain.PromptTemplates.Enums;
using MediatR;

namespace KnowledgeFoundry.Application.Assessments.Commands.GenerateQuiz;

public sealed class GenerateQuizCommandHandler
    : IRequestHandler<GenerateQuizCommand, Result<Guid>>
{
    private readonly ILessonRepository _lessonRepository;
    private readonly IQuizRepository _quizRepository;
    private readonly IPromptTemplateRepository _templateRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly IQuizGenerationQueue _queue;
    private readonly ICurrentUserContext _currentUserContext;

    public GenerateQuizCommandHandler(
        ILessonRepository lessonRepository,
        IQuizRepository quizRepository,
        IPromptTemplateRepository templateRepository,
        IUnitOfWork unitOfWork,
        IQuizGenerationQueue queue,
        ICurrentUserContext currentUserContext)
    {
        _lessonRepository = lessonRepository;
        _quizRepository = quizRepository;
        _templateRepository = templateRepository;
        _unitOfWork = unitOfWork;
        _queue = queue;
        _currentUserContext = currentUserContext;
    }

    public async Task<Result<Guid>> Handle(
        GenerateQuizCommand request,
        CancellationToken cancellationToken)
    {
        var userId = _currentUserContext.UserId;
        if (string.IsNullOrWhiteSpace(userId))
        {
            return Result<Guid>.Failure(new Error("Unauthorized", "You must be logged in."));
        }

        // 1. Validate the Lesson exists and is completed
        var lesson = await _lessonRepository.GetByIdAsync(request.LessonId, cancellationToken);
        if (lesson is null)
            return Result<Guid>.Failure(new Error("Quiz.LessonNotFound", "The specified lesson does not exist."));

        if (lesson.Status != LessonStatus.Completed || lesson.Content is null)
            return Result<Guid>.Failure(new Error("Quiz.LessonNotComplete", "Cannot generate a quiz for a lesson that is not completed."));

        // 2. Validate the Assessment Template
        var template = await _templateRepository.GetByIdAsync(request.PromptTemplateId, cancellationToken);
        if (template is null)
            return Result<Guid>.Failure(new Error("Quiz.TemplateNotFound", "The assessment prompt template was not found."));

        if (template.Purpose != PromptPurpose.QuizGeneration)
            return Result<Guid>.Failure(new Error("Quiz.InvalidTemplate", "The selected template is not configured for Quiz Generation."));

        var activeVersion = template.Versions.SingleOrDefault(v => v.Status == PromptStatus.Active);
        if (activeVersion is null)
            return Result<Guid>.Failure(new Error("Quiz.NoActiveTemplate", "The selected template has no active version."));

        // 3. Create the Draft Quiz Entity
        var quizTitle = $"Assessment: {lesson.Title.Value}";
        var quiz = Quiz.Create(
            userId,
            lesson.Id,
            quizTitle,
            request.PromptTemplateId);

        await _quizRepository.AddAsync(quiz, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        // 4. Queue the background job to call the AI
        var job = new QuizGenerationJob(
            quiz.Id,
            lesson.Id,
            request.PromptTemplateId,
            request.QuestionCount,
            request.QuizFormat,
            request.OverrideProvider,
            request.OverrideModel);

        await _queue.QueueQuizAsync(job, cancellationToken);

        // 5. Instantly return the ID to the UI
        return Result<Guid>.Success(quiz.Id);
    }
}
