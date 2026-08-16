using KnowledgeFoundry.Application.Common.Models;
using KnowledgeFoundry.Application.Common.Results;
using MediatR;

namespace KnowledgeFoundry.Application.Lessons.Queries.GetLessons;

// Returns a List of Summaries!
public sealed record GetLessonsQuery : IRequest<Result<IReadOnlyList<LessonSummaryDto>>>;
