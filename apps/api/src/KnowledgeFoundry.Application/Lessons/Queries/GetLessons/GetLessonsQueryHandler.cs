using KnowledgeFoundry.Application.Abstractions.Persistence;
using KnowledgeFoundry.Application.Common.Models;
using KnowledgeFoundry.Application.Common.Results;
using KnowledgeFoundry.Application.DomainModels;
using MediatR;

namespace KnowledgeFoundry.Application.Lessons.Queries.GetLessons;

internal sealed class GetLessonsQueryHandler
    : IRequestHandler<GetLessonsQuery, Result<PagedResponse<LessonDtos>>>
{
    private readonly ILessonRepository _repository;

    public GetLessonsQueryHandler(ILessonRepository repository)
    {
        _repository = repository;
    }

    public async Task<Result<PagedResponse<LessonDtos>>> Handle(
        GetLessonsQuery request,
        CancellationToken cancellationToken)
    {
        var (lessons, totalCount) = await _repository.GetPagedAsync(
            request.PageNumber,
            request.PageSize,
            request.SearchTerm,
            request.Status,
            cancellationToken);

        // 2. Map Entities to DTOs
        var dtos = lessons.Select(lesson => new LessonDtos(
            lesson.Id,
            lesson.Title.Value,
            lesson.Topic.Value,
            lesson.Audience.Value,
            lesson.Status.ToString(),
            lesson.CreatedAt,
            lesson.CompletedAt,
            lesson.IsManuallyEdited,
            null
        )).ToList();

        // 3. Wrap in our new PagedResponse
        var response = new PagedResponse<LessonDtos>(
            dtos,
            totalCount,
            request.PageNumber,
            request.PageSize);

        return Result<PagedResponse<LessonDtos>>.Success(response);
    }
}
