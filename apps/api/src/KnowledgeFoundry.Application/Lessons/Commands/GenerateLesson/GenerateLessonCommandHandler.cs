using KnowledgeFoundry.Application.Abstractions.Persistence;
using KnowledgeFoundry.Application.Abstractions.Services;
using KnowledgeFoundry.Application.Common.Errors;
using KnowledgeFoundry.Application.Common.Results;
using KnowledgeFoundry.Application.PromptTemplates.Queries.GetActivePromptPayload;
using KnowledgeFoundry.Domain.AiPlatform;
using KnowledgeFoundry.Domain.AiPlatform.Enums;
using KnowledgeFoundry.Domain.ContextPacks.Enums;
using KnowledgeFoundry.Domain.Lessons;
using KnowledgeFoundry.Domain.PromptTemplates.Enums;
using MediatR;
using System.Text;
using System.Text.RegularExpressions;

namespace KnowledgeFoundry.Application.Lessons.Commands.GenerateLesson;

public sealed class GenerateLessonCommandHandler
    : IRequestHandler<GenerateLessonCommand, Result<Guid>>
{
    private readonly ILessonRepository _lessonRepository;
    private readonly IPromptTemplateRepository _templateRepository;
    private readonly IContextPackRepository _contextPackRepository;
    private readonly IAiExecutionLogRepository _executionLogRepository;
    private readonly ICorpSettingsRepository _settingsRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly IPromptExecutionService _executionService;

    public GenerateLessonCommandHandler(
        ILessonRepository lessonRepository,
        IPromptTemplateRepository templateRepository,
        IContextPackRepository contextPackRepository,
        IAiExecutionLogRepository executionLogRepository,
        ICorpSettingsRepository settingsRepository,
        IUnitOfWork unitOfWork,
        IPromptExecutionService executionService)
    {
        _lessonRepository = lessonRepository;
        _templateRepository = templateRepository;
        _contextPackRepository = contextPackRepository;
        _executionLogRepository = executionLogRepository;
        _settingsRepository = settingsRepository;
        _unitOfWork = unitOfWork;
        _executionService = executionService;
    }

    public async Task<Result<Guid>> Handle(
        GenerateLessonCommand request,
        CancellationToken cancellationToken)
    {
        var currentCount = await _lessonRepository.CountAsync(cancellationToken);
        var settings = await _settingsRepository.GetSettingsAsync(cancellationToken);

        if (currentCount >= settings.MaxLessons)
        {
            return Result<Guid>.Failure(new Error(
                "Quota.Exceeded",
                $"You have reached the maximum allowed Lessons ({settings.MaxLessons}). Upgrade your plan to create more."));
        }

        var template = await _templateRepository.GetByIdAsync(request.PromptTemplateId, cancellationToken);
        if (template is null) return Result<Guid>.Failure(LessonErrors.TemplateNotFound);

        var activeVersion = template.Versions.SingleOrDefault(v => v.Status == PromptStatus.Active);
        if (activeVersion is null) return Result<Guid>.Failure(LessonErrors.NoActiveTemplate);

        string contextContent = string.Empty;
        if (request.ContextPackId.HasValue)
        {
            var pack = await _contextPackRepository.GetByIdAsync(request.ContextPackId.Value, cancellationToken);
            if (pack is null) return Result<Guid>.Failure(LessonErrors.ContextPackNotFound);

            var activePackVersion = pack.Versions.SingleOrDefault(v => v.Status == ContextPackStatus.Active);
            if (activePackVersion is not null)
            {
                var sb = new StringBuilder();
                foreach (var section in activePackVersion.Sections.OrderBy(s => s.Order))
                {
                    sb.AppendLine($"# {section.Title}");
                    sb.AppendLine(section.Content);
                    sb.AppendLine();
                }
                contextContent = sb.ToString();
            }
        }

        // Resolve the Provider and Model 
        var provider = request.OverrideProvider ?? template.Provider;
        var model = !string.IsNullOrWhiteSpace(request.OverrideModel) ? request.OverrideModel : template.Model.Value;

        // 3. Create the Lesson entity (Notice we no longer pass provider/model here!)
        var lesson = Lesson.CreatePending(
            request.Title,
            request.Topic,
            request.Audience,
            request.PromptTemplateId,
            request.ContextPackId);

        await _lessonRepository.AddAsync(lesson, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        var injectedMessages = new List<MessagePayloadDto>();
        foreach (var message in activeVersion.Messages.OrderBy(m => m.Order))
        {
            var content = message.Content;
            content = content.Replace("{Topic}", request.Topic, StringComparison.OrdinalIgnoreCase);
            content = content.Replace("{Audience}", request.Audience, StringComparison.OrdinalIgnoreCase);
            content = Regex.Replace(content, @"\{Context(:[a-zA-Z0-9_-]+)?\}", contextContent, RegexOptions.IgnoreCase);
            injectedMessages.Add(new MessagePayloadDto(message.Role.ToString(), content));
        }

        try
        {
            // 5. Execute AI
            var executionResult = await _executionService.ExecuteAsync(
                injectedMessages,
                provider,
                model,
                cancellationToken);

            var executionLog = AiExecutionLog.LogExecution(
                provider,
                model,
                executionResult.TokensUsed,
                executionResult.ExecutionTimeMs,
                ExecutionInitiator.LessonGeneration,
                request.PromptTemplateId);

            await _executionLogRepository.AddAsync(executionLog, cancellationToken);

            lesson.MarkAsCompleted(executionResult.Response, executionLog.Id);
        }
        catch (Exception ex)
        {
            lesson.MarkAsFailed(ex.Message);
        }

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result<Guid>.Success(lesson.Id);
    }
}
