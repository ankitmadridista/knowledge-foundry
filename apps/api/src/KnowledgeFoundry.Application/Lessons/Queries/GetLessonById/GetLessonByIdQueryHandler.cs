using KnowledgeFoundry.Application.Abstractions.Persistence;
using KnowledgeFoundry.Application.Common.Errors;
using KnowledgeFoundry.Application.Common.Models;
using KnowledgeFoundry.Application.Common.Results;
using MediatR;

namespace KnowledgeFoundry.Application.Lessons.Queries.GetLessonById;

internal sealed class GetLessonByIdQueryHandler
    : IRequestHandler<GetLessonByIdQuery, Result<LessonDto>>
{
    private readonly ILessonRepository _repository;

    public GetLessonByIdQueryHandler(ILessonRepository repository)
    {
        _repository = repository;
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
            lesson.IsManuallyEdited);

        return Result<LessonDto>.Success(dto);
    }
}
