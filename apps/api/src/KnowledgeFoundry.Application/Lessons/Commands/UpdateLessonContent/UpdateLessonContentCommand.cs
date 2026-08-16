using KnowledgeFoundry.Application.Common.Results;
using MediatR;

namespace KnowledgeFoundry.Application.Lessons.Commands.UpdateLessonContent;

public sealed record UpdateLessonContentCommand(
    Guid Id,
    string NewContent) : IRequest<Result>;
