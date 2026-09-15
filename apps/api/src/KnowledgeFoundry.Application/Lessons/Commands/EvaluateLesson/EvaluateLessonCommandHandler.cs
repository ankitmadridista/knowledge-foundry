using KnowledgeFoundry.Application.Abstractions.Persistence;
using KnowledgeFoundry.Application.Abstractions.Services;
using KnowledgeFoundry.Application.Common.Errors;
using KnowledgeFoundry.Application.Common.Results;
using KnowledgeFoundry.Application.DomainModels;
using KnowledgeFoundry.Domain.AiPlatform;
using KnowledgeFoundry.Domain.AiPlatform.Enums;
using KnowledgeFoundry.Domain.Lessons;
using KnowledgeFoundry.Domain.Lessons.Enums;
using KnowledgeFoundry.Domain.PromptTemplates.Enums;
using MediatR;
using System.Text.RegularExpressions;

namespace KnowledgeFoundry.Application.Lessons.Commands.EvaluateLesson;

public sealed class EvaluateLessonCommandHandler
    : IRequestHandler<EvaluateLessonCommand, Result<Guid>>
{
    private readonly ILessonRepository _lessonRepository;
    private readonly IPromptTemplateRepository _templateRepository;
    private readonly IAiExecutionLogRepository _executionLogRepository;
    private readonly IPromptExecutionService _executionService;
    private readonly IUnitOfWork _unitOfWork;

    public EvaluateLessonCommandHandler(
        ILessonRepository lessonRepository,
        IPromptTemplateRepository templateRepository,
        IAiExecutionLogRepository executionLogRepository,
        IPromptExecutionService executionService,
        IUnitOfWork unitOfWork)
    {
        _lessonRepository = lessonRepository;
        _templateRepository = templateRepository;
        _executionLogRepository = executionLogRepository;
        _executionService = executionService;
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<Guid>> Handle(
        EvaluateLessonCommand request,
        CancellationToken cancellationToken)
    {
        // 1. Fetch and validate the Lesson
        var lesson = await _lessonRepository.GetByIdAsync(request.LessonId, cancellationToken);
        if (lesson is null) return Result<Guid>.Failure(LessonErrors.NotFound);

        if (lesson.Status != LessonStatus.Completed)
        {
            return Result<Guid>.Failure(new Error(
                "Lesson.NotCompleted",
                "Only completed lessons can be evaluated."));
        }

        // 2. Fetch and validate the Evaluation Template
        var template = await _templateRepository.GetByIdAsync(request.EvaluatorPromptTemplateId, cancellationToken);
        if (template is null) return Result<Guid>.Failure(LessonErrors.TemplateNotFound);

        if (template.Purpose != PromptPurpose.Evaluation)
        {
            return Result<Guid>.Failure(new Error(
                "Lesson.InvalidTemplate",
                "The selected template is not an Evaluation template."));
        }

        var activeVersion = template.Versions.SingleOrDefault(v => v.Status == PromptStatus.Active);
        if (activeVersion is null) return Result<Guid>.Failure(LessonErrors.NoActiveTemplate);

        // 3. Build the prompt messages by injecting the Lesson Content
        var provider = request.OverrideProvider ?? template.Provider;
        var model = request.OverrideModel ?? template.Model.Value;

        var lessonContent = lesson.Content?.Value ?? string.Empty;
        var messages = new List<MessagePayloadDto>();

        foreach (var message in activeVersion.Messages.OrderBy(m => m.Order))
        {
            var content = message.Content.Replace("{LessonContent}", lessonContent, StringComparison.OrdinalIgnoreCase);
            messages.Add(new MessagePayloadDto(message.Role.ToString().ToLowerInvariant(), content));
        }

        // 4. Execute the AI Pipeline synchronously
        var executionResult = await _executionService.ExecuteAsync(messages, provider, model, activeVersion.Capability, cancellationToken);

        // 5. Sanitize the output (Strip ```json markdown blocks)
        var sanitizedJson = SanitizeJsonOutput(executionResult.Response);

        // 6. Log the execution telemetry
        var log = AiExecutionLog.LogExecution(
            provider,
            model,
            executionResult.TokensUsed,
            executionResult.ExecutionTimeMs,
            ExecutionInitiator.LessonEvaluation,
            template.Id);

        await _executionLogRepository.AddAsync(log, cancellationToken);

        // 7. Attach the Evaluation to the Lesson
        var evaluation = LessonEvaluation.Create(
            lesson.Id,
            template.Id,
            sanitizedJson,
            provider,
            model,
            log.Id);

        lesson.AddEvaluation(evaluation);

        // 8. Save all changes
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result<Guid>.Success(evaluation.Id);
    }

    /// <summary>
    /// LLMs frequently wrap JSON in markdown code blocks even when told not to. 
    /// This resiliently extracts just the JSON payload.
    /// </summary>
    private static string SanitizeJsonOutput(string rawOutput)
    {
        if (string.IsNullOrWhiteSpace(rawOutput)) return "{}";

        var text = rawOutput.Trim();

        // Regex to extract content between ```json and ``` or just ``` and ```
        var match = Regex.Match(text, @"```(?:json)?\s*(.*?)\s*```", RegexOptions.Singleline | RegexOptions.IgnoreCase);

        if (match.Success)
        {
            return match.Groups[1].Value.Trim();
        }

        // If no markdown blocks were found, assume the raw text is the JSON
        return text;
    }
}
