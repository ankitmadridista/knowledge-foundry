using KnowledgeFoundry.Application.Common.Models;
using KnowledgeFoundry.Application.Common.Results;
using KnowledgeFoundry.Application.DomainModels;
using MediatR;

namespace KnowledgeFoundry.Application.Lessons.Queries.GetLessonById;

public sealed record GetLessonByIdQuery(Guid Id) : IRequest<Result<LessonDto>>;
