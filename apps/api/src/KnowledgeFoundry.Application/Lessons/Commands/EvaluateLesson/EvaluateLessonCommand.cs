using KnowledgeFoundry.Application.Common.Results;
using KnowledgeFoundry.Domain.PromptTemplates.Enums;
using MediatR;

namespace KnowledgeFoundry.Application.Lessons.Commands.EvaluateLesson;

public sealed record EvaluateLessonCommand(
    Guid LessonId,
    Guid EvaluatorPromptTemplateId,
    AiProvider? OverrideProvider = null,
    string? OverrideModel = null
) : IRequest<Result<Guid>>;
