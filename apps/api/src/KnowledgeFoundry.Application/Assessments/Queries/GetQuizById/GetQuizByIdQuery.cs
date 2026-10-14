using KnowledgeFoundry.Application.Common.Results;
using KnowledgeFoundry.Application.DomainModels;
using MediatR;

namespace KnowledgeFoundry.Application.Assessments.Queries.GetQuizById;

public sealed record GetQuizByIdQuery(Guid Id) : IRequest<Result<QuizDto>>;
