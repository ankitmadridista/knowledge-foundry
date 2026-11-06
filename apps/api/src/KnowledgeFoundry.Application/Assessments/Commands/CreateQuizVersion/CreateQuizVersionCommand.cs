using KnowledgeFoundry.Application.Common.Results;
using MediatR;

namespace KnowledgeFoundry.Application.Quizzes.Commands.CreateQuizVersion;

public record CreateQuizVersionCommand(Guid QuizId, string UserId) : IRequest<Result<Guid>>;
