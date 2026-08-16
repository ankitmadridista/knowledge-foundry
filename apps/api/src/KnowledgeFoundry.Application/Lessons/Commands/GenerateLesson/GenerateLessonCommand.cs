using KnowledgeFoundry.Application.Common.Results;
using MediatR;

namespace KnowledgeFoundry.Application.Lessons.Commands.GenerateLesson;

public sealed record GenerateLessonCommand(
    string Title,
    string Topic,
    string Audience,
    Guid PromptTemplateId,
    Guid? ContextPackId) : IRequest<Result<Guid>>;
