using KnowledgeFoundry.Application.Common.Results;
using KnowledgeFoundry.Domain.PromptTemplates.Enums;
using MediatR;

namespace KnowledgeFoundry.Application.Lessons.Commands.GenerateLesson;

public sealed record GenerateLessonCommand(
    string Title,
    string Topic,
    string Audience,
    Guid PromptTemplateId,
    Guid? ContextPackId,
    AiProvider? OverrideProvider = null,
    string? OverrideModel = null,
    Guid? CriticPromptTemplateId = null,
    AiProvider? CriticProvider = null,
    string? CriticModel = null
    ) : IRequest<Result<Guid>>;
