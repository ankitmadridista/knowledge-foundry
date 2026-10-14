using KnowledgeFoundry.Application.Abstractions.Persistence;
using KnowledgeFoundry.Application.Abstractions.Services;
using KnowledgeFoundry.Application.BackgroundProcessing;
using KnowledgeFoundry.Application.DomainModels;
using KnowledgeFoundry.Domain.AiPlatform;
using KnowledgeFoundry.Domain.AiPlatform.Enums;
using KnowledgeFoundry.Domain.Assessments.Enums;
using KnowledgeFoundry.Domain.Assessments.ValueObjects;
using KnowledgeFoundry.Domain.Lessons;
using KnowledgeFoundry.Domain.PromptTemplates.Enums;
using KnowledgeFoundry.Domain.PromptTemplates.ValueObjects;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using System.Text.Json;

namespace KnowledgeFoundry.Infrastructure.BackgroundProcessing;

public class QuizGenerationWorker : BackgroundService
{
    private readonly IQuizGenerationQueue _queue;
    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<QuizGenerationWorker> _logger;

    public QuizGenerationWorker(
        IQuizGenerationQueue queue,
        IServiceProvider serviceProvider,
        ILogger<QuizGenerationWorker> logger)
    {
        _queue = queue;
        _serviceProvider = serviceProvider;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("Quiz Generation Worker is starting.");

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                var job = await _queue.DequeueAsync(stoppingToken);

                using var scope = _serviceProvider.CreateScope();
                var db = scope.ServiceProvider.GetRequiredService<IUnitOfWork>();
                var quizRepo = scope.ServiceProvider.GetRequiredService<IQuizRepository>();
                var lessonRepo = scope.ServiceProvider.GetRequiredService<ILessonRepository>();
                var templateRepo = scope.ServiceProvider.GetRequiredService<IPromptTemplateRepository>();
                var executionLogRepo = scope.ServiceProvider.GetRequiredService<IAiExecutionLogRepository>();
                var executionService = scope.ServiceProvider.GetRequiredService<IPromptExecutionService>();

                var quiz = await quizRepo.GetByIdAsync(job.QuizId, stoppingToken);
                var lesson = await lessonRepo.GetByIdAsync(job.LessonId, stoppingToken);

                if (quiz == null || lesson == null || lesson.Content == null) continue;

                try
                {
                    var template = await templateRepo.GetByIdAsync(job.PromptTemplateId, stoppingToken);
                    var version = template!.Versions.FirstOrDefault(v => v.Status == PromptStatus.Active);
                    if (version == null) throw new Exception("Assessment Persona has no active version.");

                    var provider = job.OverrideProvider.HasValue ? (AiProvider)job.OverrideProvider.Value : template.Provider;
                    var model = job.OverrideModel ?? template.Model.Value;

                    var messages = BuildMessages(version.Messages, lesson, job.QuestionCount, job.QuizFormat);

                    // Execute with StructuredOutput capability to enforce JSON
                    var result = await executionService.ExecuteAsync(messages, provider, model, PromptCapability.StructuredOutput, stoppingToken);

                    var logId = await LogExecutionAsync(provider, model, result, job.PromptTemplateId, executionLogRepo, stoppingToken);

                    // Deserialize the JSON array returned by the LLM
                    var options = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
                    var generatedQuestions = JsonSerializer.Deserialize<List<QuizQuestionDto>>(result.Response, options);

                    if (generatedQuestions == null || !generatedQuestions.Any())
                        throw new Exception("LLM returned an empty or invalid JSON array.");

                    // Map to Aggregate Root via Value Objects
                    foreach (var qDto in generatedQuestions)
                    {
                        var type = Enum.TryParse<QuestionType>(qDto.Type, true, out var parsedType)
                            ? parsedType
                            : QuestionType.MultipleChoice;

                        var question = quiz.AddQuestion(new QuestionText(qDto.Text), type, qDto.Explanation);

                        foreach (var optDto in qDto.Options)
                        {
                            question.AddOption(new OptionText(optDto.Text), optDto.IsCorrect);
                        }
                    }

                    await db.SaveChangesAsync(stoppingToken);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Failed to generate quiz {QuizId}", job.QuizId);

                    try
                    {
                        using var failScope = _serviceProvider.CreateScope();
                        var failDb = failScope.ServiceProvider.GetRequiredService<IUnitOfWork>();
                        var failRepo = failScope.ServiceProvider.GetRequiredService<IQuizRepository>();

                        var failedQuiz = await failRepo.GetByIdAsync(job.QuizId, CancellationToken.None);
                        if (failedQuiz != null)
                        {
                            // Truncate the error message just in case it exceeds column limits
                            var safeErrorMessage = ex.Message.Length > 2000 ? ex.Message.Substring(0, 2000) + "..." : ex.Message;
                            failedQuiz.MarkAsFailed(safeErrorMessage);

                            // Use CancellationToken.None so this saves even if the user refreshed the page
                            await failDb.SaveChangesAsync(CancellationToken.None);
                        }
                    }
                    catch (Exception fatalEx)
                    {
                        _logger.LogCritical(fatalEx, "FATAL: Could not even save the Failed status for Quiz {QuizId} to the database.", job.QuizId);
                    }
                }
            }
            catch (OperationCanceledException) { }
            catch (Exception ex)
            {
                _logger.LogError(ex, "A fatal error occurred while preparing a background quiz job.");
            }
        }
    }

    private static List<MessagePayloadDto> BuildMessages(
        IEnumerable<PromptMessage> templateMessages,
        Lesson lesson,
        int questionCount,
        string quizFormat)
    {
        var injectedMessages = new List<MessagePayloadDto>();
        foreach (var message in templateMessages.OrderBy(m => m.Order))
        {
            var content = message.Content;
            content = content.Replace("{Topic}", lesson.Topic.Value, StringComparison.OrdinalIgnoreCase);
            content = content.Replace("{Audience}", lesson.Audience.Value, StringComparison.OrdinalIgnoreCase);
            content = content.Replace("{LessonContent}", lesson.Content!.Value, StringComparison.OrdinalIgnoreCase);
            content = content.Replace("{QuestionCount}", questionCount.ToString(), StringComparison.OrdinalIgnoreCase);
            content = content.Replace("{QuizFormat}", quizFormat, StringComparison.OrdinalIgnoreCase);

            injectedMessages.Add(new MessagePayloadDto(message.Role.ToString().ToLowerInvariant(), content));
        }
        return injectedMessages;
    }

    private static async Task<Guid> LogExecutionAsync(
        AiProvider provider, string model, ExecutionTelemetry result, Guid templateId,
        IAiExecutionLogRepository repo, CancellationToken cancellationToken)
    {
        var log = AiExecutionLog.LogExecution(provider, model, result.TokensUsed, result.ExecutionTimeMs, ExecutionInitiator.LessonGeneration, templateId);
        await repo.AddAsync(log, cancellationToken);
        return log.Id;
    }

    // Private DTOs strictly for deserializing the LLM's JSON response
    private class QuizQuestionDto
    {
        public string Text { get; set; } = string.Empty;
        public string Type { get; set; } = string.Empty;
        public string? Explanation { get; set; }
        public List<QuizOptionDto> Options { get; set; } = [];
    }

    private class QuizOptionDto
    {
        public string Text { get; set; } = string.Empty;
        public bool IsCorrect { get; set; }
    }
}
