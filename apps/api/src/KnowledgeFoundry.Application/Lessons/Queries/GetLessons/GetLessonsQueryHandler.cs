using KnowledgeFoundry.Application.Abstractions.Persistence;
using KnowledgeFoundry.Application.Common.Models;
using KnowledgeFoundry.Application.Common.Results;
using MediatR;

namespace KnowledgeFoundry.Application.Lessons.Queries.GetLessons;

internal sealed class GetLessonsQueryHandler
    : IRequestHandler<GetLessonsQuery, Result<IReadOnlyList<LessonSummaryDto>>>
{
    private readonly ILessonRepository _repository;

    public GetLessonsQueryHandler(ILessonRepository repository)
    {
        _repository = repository;
    }

    public async Task<Result<IReadOnlyList<LessonSummaryDto>>> Handle(
        GetLessonsQuery request,
        CancellationToken cancellationToken)
    {
        var lessons = await _repository.GetAllAsync(cancellationToken);

        var dtos = lessons.Select(lesson => new LessonSummaryDto(
            lesson.Id,
            lesson.Title.Value,
            lesson.Topic.Value,
            lesson.Audience.Value,
            lesson.Status.ToString(),
            lesson.CreatedAt,
            lesson.CompletedAt
        )).ToList();

        return Result<IReadOnlyList<LessonSummaryDto>>.Success(dtos);
    }
}
