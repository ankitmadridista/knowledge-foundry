using KnowledgeFoundry.Application.Abstractions.Persistence;
using KnowledgeFoundry.Application.Abstractions.Services;
using KnowledgeFoundry.Application.BackgroundProcessing;
using KnowledgeFoundry.Application.Common.Errors;
using KnowledgeFoundry.Application.Common.Results;
using KnowledgeFoundry.Domain.Lessons;
using KnowledgeFoundry.Domain.PromptTemplates.Enums;
using MediatR;

namespace KnowledgeFoundry.Application.Lessons.Commands.GenerateLesson;

public sealed class GenerateLessonCommandHandler
    : IRequestHandler<GenerateLessonCommand, Result<Guid>>
{
    private readonly ILessonRepository _lessonRepository;
    private readonly IPromptTemplateRepository _templateRepository;
    private readonly IContextPackRepository _contextPackRepository;
    private readonly ICorpSettingsRepository _settingsRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ILessonGenerationQueue _queue;
    private readonly ICurrentUserContext _currentUserContext;

    public GenerateLessonCommandHandler(
        ILessonRepository lessonRepository,
        IPromptTemplateRepository templateRepository,
        IContextPackRepository contextPackRepository,
        ICorpSettingsRepository settingsRepository,
        IUnitOfWork unitOfWork,
        ILessonGenerationQueue queue,
        ICurrentUserContext currentUserContext)
    {
        _lessonRepository = lessonRepository;
        _templateRepository = templateRepository;
        _contextPackRepository = contextPackRepository;
        _settingsRepository = settingsRepository;
        _unitOfWork = unitOfWork;
        _queue = queue;
        _currentUserContext = currentUserContext;
    }

    public async Task<Result<Guid>> Handle(
        GenerateLessonCommand request,
        CancellationToken cancellationToken)
    {
        // 1. Quota Check
        var currentCount = await _lessonRepository.CountAsync(cancellationToken);
        var settings = await _settingsRepository.GetSettingsAsync(cancellationToken);

        if (currentCount >= settings.MaxLessons)
        {
            return Result<Guid>.Failure(new Error(
                "Quota.Exceeded",
                $"You have reached the maximum allowed Lessons ({settings.MaxLessons})."));
        }

        var userId = _currentUserContext.UserId;
        if (string.IsNullOrWhiteSpace(userId))
        {
            return Result<Guid>.Failure(new Error("Unauthorized", "You must be logged in."));
        }

        // 2. Validate the Actor Template (Fail fast if invalid)
        var template = await _templateRepository.GetByIdAsync(request.PromptTemplateId, cancellationToken);
        if (template is null) return Result<Guid>.Failure(LessonErrors.TemplateNotFound);

        var activeVersion = template.Versions.SingleOrDefault(v => v.Status == PromptStatus.Active);
        if (activeVersion is null) return Result<Guid>.Failure(LessonErrors.NoActiveTemplate);

        // 3. Validate Context Pack (if provided)
        if (request.ContextPackId.HasValue)
        {
            var pack = await _contextPackRepository.GetByIdAsync(request.ContextPackId.Value, cancellationToken);
            if (pack is null) return Result<Guid>.Failure(LessonErrors.ContextPackNotFound);
        }

        // 4. Validate the Critic Template (if provided)
        if (request.CriticPromptTemplateId.HasValue)
        {
            var criticTemplate = await _templateRepository.GetByIdAsync(request.CriticPromptTemplateId.Value, cancellationToken);
            if (criticTemplate is null) return Result<Guid>.Failure(new Error("Lesson.CriticNotFound", "Critic template was not found."));

            var activeCriticVersion = criticTemplate.Versions.SingleOrDefault(v => v.Status == PromptStatus.Active);
            if (activeCriticVersion is null) return Result<Guid>.Failure(new Error("Lesson.NoActiveCritic", "The selected Critic template has no active version."));
        }

        // 5. Create the Initial Lesson Entity (Starts in 'Drafting' state)
        var lesson = Lesson.CreatePending(
            _currentUserContext.UserId,
            request.Title,
            request.Topic,
            request.Audience,
            request.PromptTemplateId,
            request.CriticPromptTemplateId,
            request.ContextPackId);

        await _lessonRepository.AddAsync(lesson, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        // 6. Queue the background job with all necessary instructions
        var job = new LessonGenerationJob(
            lesson.Id,
            request.PromptTemplateId,
            request.ContextPackId,
            request.CriticPromptTemplateId,
            request.Topic,
            request.Audience,
            (int?)request.OverrideProvider,
            request.OverrideModel,
            (int?)request.CriticProvider,
            request.CriticModel);

        await _queue.QueueLessonAsync(job, cancellationToken);

        // 7. Instantly return the ID to the UI!
        return Result<Guid>.Success(lesson.Id);
    }
}
