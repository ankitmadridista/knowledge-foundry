using KnowledgeFoundry.Application.Abstractions.Persistence;
using KnowledgeFoundry.Application.Common.Models;
using KnowledgeFoundry.Application.Common.Results;
using MediatR;

namespace KnowledgeFoundry.Application.Lessons.Queries.GetLessons;

internal sealed class GetLessonsQueryHandler
    : IRequestHandler<GetLessonsQuery, Result<PagedResponse<LessonSummaryDto>>>
{
    private readonly ILessonRepository _repository;

    public GetLessonsQueryHandler(ILessonRepository repository)
    {
        _repository = repository;
    }

    public async Task<Result<PagedResponse<LessonSummaryDto>>> Handle(
        GetLessonsQuery request,
        CancellationToken cancellationToken)
    {
        // 1. Fetch paged data and total count from the DB
        var (lessons, totalCount) = await _repository.GetPagedAsync(
            request.PageNumber,
            request.PageSize,
            cancellationToken);

        // 2. Map Entities to DTOs
        var dtos = lessons.Select(lesson => new LessonSummaryDto(
            lesson.Id,
            lesson.Title.Value,
            lesson.Topic.Value,
            lesson.Audience.Value,
            lesson.Status.ToString(),
            lesson.CreatedAt,
            lesson.CompletedAt,
            lesson.IsManuallyEdited
        )).ToList();

        // 3. Wrap in our new PagedResponse
        var response = new PagedResponse<LessonSummaryDto>(
            dtos,
            totalCount,
            request.PageNumber,
            request.PageSize);

        return Result<PagedResponse<LessonSummaryDto>>.Success(response);
    }
}
