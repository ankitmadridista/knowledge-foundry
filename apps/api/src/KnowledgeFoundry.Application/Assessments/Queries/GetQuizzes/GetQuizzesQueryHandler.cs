using KnowledgeFoundry.Application.Abstractions.Persistence;
using KnowledgeFoundry.Application.Common.Models;
using KnowledgeFoundry.Application.Common.Results;
using KnowledgeFoundry.Application.DomainModels;
using MediatR;

namespace KnowledgeFoundry.Application.Assessments.Queries.GetQuizzes;

internal sealed class GetQuizzesQueryHandler
    : IRequestHandler<GetQuizzesQuery, Result<PagedResponse<QuizDtos>>>
{
    private readonly IQuizRepository _repository;

    public GetQuizzesQueryHandler(IQuizRepository repository)
    {
        _repository = repository;
    }

    public async Task<Result<PagedResponse<QuizDtos>>> Handle(
        GetQuizzesQuery request,
        CancellationToken cancellationToken)
    {
        var (quizzes, totalCount) = await _repository.GetPagedAsync(
            request.PageNumber,
            request.PageSize,
            request.SearchTerm,
            request.Status,
            request.LessonId,
            cancellationToken);

        var dtos = quizzes.Select(quiz => new QuizDtos(
            quiz.Id,
            quiz.LessonId,
            quiz.Title.Value,
            quiz.Status.ToString(),
            quiz.Questions.Count,
            quiz.CreatedAt,
            quiz.PublishedAt,
            null
        )).ToList();

        var response = new PagedResponse<QuizDtos>(
            dtos,
            totalCount,
            request.PageNumber,
            request.PageSize);

        return Result<PagedResponse<QuizDtos>>.Success(response);
    }
}
