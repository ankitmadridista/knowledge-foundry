using KnowledgeFoundry.Application.Abstractions.Persistence;
using KnowledgeFoundry.Application.Abstractions.Services;
using KnowledgeFoundry.Application.BackgroundProcessing;
using KnowledgeFoundry.Application.DomainModels;
using KnowledgeFoundry.Domain.AiPlatform;
using KnowledgeFoundry.Domain.AiPlatform.Enums;
using KnowledgeFoundry.Domain.ContextPacks.Enums;
using KnowledgeFoundry.Domain.PromptTemplates.Enums;
using KnowledgeFoundry.Domain.PromptTemplates.ValueObjects;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using System.Text;
using System.Text.RegularExpressions;

namespace KnowledgeFoundry.Infrastructure.BackgroundProcessing;

public class LessonGenerationWorker : BackgroundService
{
    private readonly ILessonGenerationQueue _queue;
    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<LessonGenerationWorker> _logger;

    public LessonGenerationWorker(
        ILessonGenerationQueue queue,
        IServiceProvider serviceProvider,
        ILogger<LessonGenerationWorker> logger)
    {
        _queue = queue;
        _serviceProvider = serviceProvider;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("Lesson Generation Worker is starting.");

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                var job = await _queue.DequeueAsync(stoppingToken);

                using var scope = _serviceProvider.CreateScope();
                var db = scope.ServiceProvider.GetRequiredService<IUnitOfWork>();
                var lessonRepo = scope.ServiceProvider.GetRequiredService<ILessonRepository>();
                var templateRepo = scope.ServiceProvider.GetRequiredService<IPromptTemplateRepository>();
                var contextPackRepo = scope.ServiceProvider.GetRequiredService<IContextPackRepository>();
                var executionLogRepo = scope.ServiceProvider.GetRequiredService<IAiExecutionLogRepository>();
                var executionService = scope.ServiceProvider.GetRequiredService<IPromptExecutionService>();

                _logger.LogInformation("Processing Lesson ID: {LessonId}", job.LessonId);

                var lesson = await lessonRepo.GetByIdAsync(job.LessonId, stoppingToken);
                if (lesson == null) continue;

                try
                {
                    // 1. Load Context Pack
                    string contextContent = await LoadContextPackAsync(job.ContextPackId, contextPackRepo, stoppingToken);

                    // 2. Load Actor Template
                    var actorTemplate = await templateRepo.GetByIdAsync(job.PromptTemplateId, stoppingToken);

                    var actorVersion = actorTemplate!.Versions.FirstOrDefault(v => v.Status == PromptStatus.Active);
                    if (actorVersion == null) throw new Exception("Actor Persona has no active version.");

                    var actorProvider = job.DraftProviderId.HasValue ? (AiProvider)job.DraftProviderId.Value : actorTemplate.Provider;
                    var actorModel = job.DraftModel ?? actorTemplate.Model.Value;

                    var actorMessages = BuildMessages(actorVersion.Messages, job.Topic, job.Audience, contextContent, draftContent: null);

                    // ==========================================
                    // PHASE 1: DRAFTING
                    // ==========================================
                    var draftResult = await executionService.ExecuteAsync(actorMessages, actorProvider, actorModel, stoppingToken);
                    var draftLogId = await LogExecutionAsync(actorProvider, actorModel, draftResult, job.PromptTemplateId, executionLogRepo, stoppingToken);

                    if (!job.CriticPromptTemplateId.HasValue)
                    {
                        lesson.MarkAsCompleted(draftResult.Response, draftLogId);
                        await db.SaveChangesAsync(stoppingToken);
                        continue;
                    }

                    // ==========================================
                    // PHASE 2: CRITIQUING
                    // ==========================================
                    lesson.TransitionToCritiquing();
                    await db.SaveChangesAsync(stoppingToken);

                    var criticTemplate = await templateRepo.GetByIdAsync(job.CriticPromptTemplateId.Value, stoppingToken);

                    var criticVersion = criticTemplate!.Versions.FirstOrDefault(v => v.Status == PromptStatus.Active);
                    if (criticVersion == null) throw new Exception("Critic Persona has no active version.");

                    var criticProvider = job.CriticProviderId.HasValue ? (AiProvider)job.CriticProviderId.Value : criticTemplate.Provider;
                    var criticModel = job.CriticModel ?? criticTemplate.Model.Value;

                    var criticMessages = BuildMessages(criticVersion.Messages, job.Topic, job.Audience, contextContent, draftResult.Response);

                    var critiqueResult = await executionService.ExecuteAsync(criticMessages, criticProvider, criticModel, stoppingToken);
                    await LogExecutionAsync(criticProvider, criticModel, critiqueResult, job.CriticPromptTemplateId.Value, executionLogRepo, stoppingToken);

                    // ==========================================
                    // PHASE 3: REFINING
                    // ==========================================
                    lesson.TransitionToRefining(critiqueResult.Response);
                    await db.SaveChangesAsync(stoppingToken);

                    var refinementMessages = new List<MessagePayloadDto>(actorMessages)
                    {
                        new MessagePayloadDto("assistant", draftResult.Response),
                        new MessagePayloadDto("user", $"Please refine and rewrite the lesson based exactly on this critique feedback:\n\n{critiqueResult.Response}")
                    };

                    var refineResult = await executionService.ExecuteAsync(refinementMessages, actorProvider, actorModel, stoppingToken);
                    var refineLogId = await LogExecutionAsync(actorProvider, actorModel, refineResult, job.PromptTemplateId, executionLogRepo, stoppingToken);

                    lesson.MarkAsCompleted(refineResult.Response, refineLogId);
                    await db.SaveChangesAsync(stoppingToken);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Failed to generate lesson {LessonId}", job.LessonId);

                    try
                    {
                        using var failScope = _serviceProvider.CreateScope();
                        var failDb = failScope.ServiceProvider.GetRequiredService<IUnitOfWork>();
                        var failRepo = failScope.ServiceProvider.GetRequiredService<ILessonRepository>();

                        var failedLesson = await failRepo.GetByIdAsync(job.LessonId, CancellationToken.None);
                        if (failedLesson != null)
                        {
                            // Truncate the error message just in case it exceeds column limits
                            var safeErrorMessage = ex.Message.Length > 2000 ? ex.Message.Substring(0, 2000) + "..." : ex.Message;
                            failedLesson.MarkAsFailed(safeErrorMessage);

                            // Use CancellationToken.None so this saves even if the user refreshed the page
                            await failDb.SaveChangesAsync(CancellationToken.None);
                        }
                    }
                    catch (Exception fatalEx)
                    {
                        _logger.LogCritical(fatalEx, "FATAL: Could not even save the Failed status for Lesson {LessonId} to the database.", job.LessonId);
                    }
                }
            }
            catch (OperationCanceledException) { }
            catch (Exception ex)
            {
                _logger.LogError(ex, "A fatal error occurred while preparing a background lesson job.");
            }
        }
    }

    private static async Task<string> LoadContextPackAsync(Guid? contextPackId, IContextPackRepository repo, CancellationToken cancellationToken)
    {
        if (!contextPackId.HasValue) return string.Empty;

        var pack = await repo.GetByIdAsync(contextPackId.Value, cancellationToken);
        var activePackVersion = pack?.Versions.FirstOrDefault(v => v.Status == ContextPackStatus.Active); // Also added FirstOrDefault here to be safe!

        if (activePackVersion == null) return string.Empty;

        var sb = new StringBuilder();
        foreach (var section in activePackVersion.Sections.OrderBy(s => s.Order))
        {
            sb.AppendLine($"# {section.Title}");
            sb.AppendLine(section.Content);
            sb.AppendLine();
        }
        return sb.ToString();
    }

    private static List<MessagePayloadDto> BuildMessages(
        IEnumerable<PromptMessage> templateMessages,
        string topic,
        string audience,
        string contextContent,
        string? draftContent)
    {
        var injectedMessages = new List<MessagePayloadDto>();
        foreach (var message in templateMessages.OrderBy(m => m.Order))
        {
            var content = message.Content;
            content = content.Replace("{Topic}", topic, StringComparison.OrdinalIgnoreCase);
            content = content.Replace("{Audience}", audience, StringComparison.OrdinalIgnoreCase);
            content = Regex.Replace(content, @"\{Context(:[a-zA-Z0-9_-]+)?\}", contextContent, RegexOptions.IgnoreCase);

            if (draftContent != null)
            {
                content = content.Replace("{Draft}", draftContent, StringComparison.OrdinalIgnoreCase);
            }

            injectedMessages.Add(new MessagePayloadDto(message.Role.ToString().ToLowerInvariant(), content));
        }
        return injectedMessages;
    }

    private static async Task<Guid> LogExecutionAsync(
        AiProvider provider,
        string model,
        ExecutionTelemetry result,
        Guid templateId,
        IAiExecutionLogRepository repo,
        CancellationToken cancellationToken)
    {
        var log = AiExecutionLog.LogExecution(
            provider,
            model,
            result.TokensUsed,
            result.ExecutionTimeMs,
            ExecutionInitiator.LessonGeneration,
            templateId);

        await repo.AddAsync(log, cancellationToken);
        return log.Id;
    }
}
