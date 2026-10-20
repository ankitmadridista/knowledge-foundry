using KnowledgeFoundry.Application.Common.Results;
using MediatR;

namespace KnowledgeFoundry.Application.Assessments.Commands.PublishQuiz;

public sealed record PublishQuizCommand(Guid Id) : IRequest<Result>;
