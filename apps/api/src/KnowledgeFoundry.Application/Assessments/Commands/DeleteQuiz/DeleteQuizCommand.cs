using KnowledgeFoundry.Application.Common.Results;
using MediatR;

namespace KnowledgeFoundry.Application.Assessments.Commands.DeleteQuiz;

public sealed record DeleteQuizCommand(Guid Id) : IRequest<Result>;
