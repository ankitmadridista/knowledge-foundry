using KnowledgeFoundry.Application.Common.Results;
using MediatR;

namespace KnowledgeFoundry.Application.Assessments.Commands.UpdateQuiz;

public sealed record UpdateQuizCommand(
    Guid Id,
    string Title,
    IReadOnlyList<UpdateQuizQuestionDto> Questions) : IRequest<Result>;

public sealed record UpdateQuizQuestionDto(
    string Text,
    string Type,
    string? Explanation,
    IReadOnlyList<UpdateQuizOptionDto> Options);

public sealed record UpdateQuizOptionDto(
    string Text,
    bool IsCorrect);
