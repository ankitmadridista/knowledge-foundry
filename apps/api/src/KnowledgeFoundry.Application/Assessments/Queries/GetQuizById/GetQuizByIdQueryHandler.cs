using KnowledgeFoundry.Application.Abstractions.Persistence;
using KnowledgeFoundry.Application.Common.Errors;
using KnowledgeFoundry.Application.Common.Results;
using KnowledgeFoundry.Application.DomainModels;
using KnowledgeFoundry.Domain.AiPlatform;
using MediatR;

namespace KnowledgeFoundry.Application.Assessments.Queries.GetQuizById;

internal sealed class GetQuizByIdQueryHandler
    : IRequestHandler<GetQuizByIdQuery, Result<QuizDto>>
{
    private readonly IQuizRepository _repository;
    private readonly IAiExecutionLogRepository _logRepository;

    public GetQuizByIdQueryHandler(
        IQuizRepository repository,
        IAiExecutionLogRepository logRepository)
    {
        _repository = repository;
        _logRepository = logRepository;
    }

    public async Task<Result<QuizDto>> Handle(
        GetQuizByIdQuery request,
        CancellationToken cancellationToken)
    {
        var quiz = await _repository.GetByIdAsync(request.Id, cancellationToken);

        if (quiz is null)
        {
            return Result<QuizDto>.Failure(
                new Error("Quiz.NotFound", "The specified quiz was not found."));
        }

        AiExecutionLog? executionLog = null;
        if (quiz.AiExecutionLogId.HasValue)
        {
            executionLog = await _logRepository.GetByIdAsync(
                quiz.AiExecutionLogId.Value,
                cancellationToken);
        }

        var questionsDto = quiz.Questions.Select(q => new QuestionDto(
            q.Id,
            q.Text.Value,
            q.Type.ToString(),
            q.Explanation,
            q.Options.Select(o => new OptionDto(
                o.Id,
                o.Text.Value,
                o.IsCorrect
            )).ToList()
        )).ToList();

        var dto = new QuizDto(
            quiz.Id,
            quiz.LessonId,
            quiz.Title.Value,
            quiz.Status.ToString(),
            quiz.ErrorMessage,
            quiz.CreatedAt,
            quiz.PublishedAt,
            executionLog?.Provider,
            executionLog?.Model.Value,
            executionLog?.TokensUsed,
            executionLog?.ExecutionTimeMs,
            questionsDto);

        return Result<QuizDto>.Success(dto);
    }
}
