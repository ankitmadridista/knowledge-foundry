using KnowledgeFoundry.Application.Abstractions.Persistence;
using KnowledgeFoundry.Application.Common.Errors;
using KnowledgeFoundry.Application.Common.Results;
using MediatR;

namespace KnowledgeFoundry.Application.Lessons.Queries.GetLessonById;

internal sealed class GetLessonByIdQueryHandler
    : IRequestHandler<GetLessonByIdQuery, Result<LessonDto>>
{
    private readonly ILessonRepository _repository;
    private readonly IAiExecutionLogRepository _logRepository; // <-- Inject new repo

    public GetLessonByIdQueryHandler(
        ILessonRepository repository,
        IAiExecutionLogRepository logRepository)
    {
        _repository = repository;
        _logRepository = logRepository;
    }

    public async Task<Result<LessonDto>> Handle(
        GetLessonByIdQuery request,
        CancellationToken cancellationToken)
    {
        var lesson = await _repository.GetByIdAsync(request.Id, cancellationToken);

        if (lesson is null)
        {
            return Result<LessonDto>.Failure(LessonErrors.NotFound);
        }

        // Fetch the execution log if the lesson has one!
        KnowledgeFoundry.Domain.AiPlatform.AiExecutionLog? executionLog = null;
        if (lesson.AiExecutionLogId.HasValue)
        {
            executionLog = await _logRepository.GetByIdAsync(lesson.AiExecutionLogId.Value, cancellationToken);
        }

        var dto = new LessonDto(
            lesson.Id,
            lesson.Title.Value,
            lesson.Topic.Value,
            lesson.Audience.Value,
            lesson.Content?.Value,
            lesson.Status.ToString(),
            lesson.ErrorMessage,
            lesson.PromptTemplateId,
            lesson.ContextPackId,
            lesson.CreatedAt,
            lesson.CompletedAt,
            lesson.IsManuallyEdited,

            executionLog?.Provider,
            executionLog?.Model.Value,
            executionLog?.TokensUsed,
            executionLog?.ExecutionTimeMs);

        return Result<LessonDto>.Success(dto);
    }
}
