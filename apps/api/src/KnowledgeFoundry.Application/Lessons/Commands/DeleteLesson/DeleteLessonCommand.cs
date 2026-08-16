using KnowledgeFoundry.Application.Common.Results;
using MediatR;

namespace KnowledgeFoundry.Application.Lessons.Commands.DeleteLesson;

public sealed record DeleteLessonCommand(Guid Id) : IRequest<Result>;
