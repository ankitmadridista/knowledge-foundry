using KnowledgeFoundry.Application.Common.Models;
using KnowledgeFoundry.Application.Common.Results;
using KnowledgeFoundry.Application.DomainModels;
using MediatR;

namespace KnowledgeFoundry.Application.Lessons.Queries.GetLessons;

public sealed record GetLessonsQuery(
    int PageNumber = 1,
    int PageSize = 6,
    string? SearchTerm = null,
    int? Status = null)
    : IRequest<Result<PagedResponse<LessonDtos>>>;
