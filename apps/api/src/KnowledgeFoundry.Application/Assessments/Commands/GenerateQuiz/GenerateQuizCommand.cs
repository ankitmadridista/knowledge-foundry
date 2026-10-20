using KnowledgeFoundry.Application.Common.Results;
using MediatR;

namespace KnowledgeFoundry.Application.Assessments.Commands.GenerateQuiz;

public sealed record GenerateQuizCommand(
    Guid LessonId,
    Guid PromptTemplateId,
    int QuestionCount,
    string QuizFormat, // e.g., "Multiple Choice", "True/False", or a mix
    int? OverrideProvider = null,
    string? OverrideModel = null
) : IRequest<Result<Guid>>;
