using KnowledgeFoundry.Application.Common.Models;
using KnowledgeFoundry.Application.Common.Results;
using MediatR;

namespace KnowledgeFoundry.Application.Lessons.Queries.GetLessons;

// Returns a List of Summaries!
public sealed record GetLessonsQuery(int PageNumber = 1, int PageSize = 6) : IRequest<Result<PagedResponse<LessonSummaryDto>>>;
