using KnowledgeFoundry.Application.Common.Models;
using KnowledgeFoundry.Application.Common.Results;
using KnowledgeFoundry.Application.DomainModels;
using MediatR;

namespace KnowledgeFoundry.Application.Assessments.Queries.GetQuizzes;

public sealed record GetQuizzesQuery(
    int PageNumber = 1,
    int PageSize = 6,
    string? SearchTerm = null,
    int? Status = null,
    Guid? LessonId = null)
    : IRequest<Result<PagedResponse<QuizDtos>>>;
