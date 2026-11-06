using KnowledgeFoundry.Application.Abstractions.Persistence;
using KnowledgeFoundry.Application.Common.Results;
using KnowledgeFoundry.Application.Quizzes.Commands.CreateQuizVersion;
using KnowledgeFoundry.Domain.Assessments.Enums;
using MediatR;

namespace KnowledgeFoundry.Application.Assessments.Commands.CreateQuizVersion;

public sealed class CreateQuizVersionCommandHandler
    : IRequestHandler<CreateQuizVersionCommand, Result<Guid>>
{
    private readonly IQuizRepository _repository;
    private readonly IUnitOfWork _unitOfWork;

    public CreateQuizVersionCommandHandler(
        IQuizRepository repository,
        IUnitOfWork unitOfWork)
    {
        _repository = repository;
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<Guid>> Handle(CreateQuizVersionCommand request, CancellationToken cancellationToken)
    {
        var existingQuiz = await _repository.GetByIdAsync(request.QuizId, cancellationToken);

        // 1. Not Found Check
        if (existingQuiz is null)
        {
            return Result<Guid>.Failure(
                new Error("Quiz.NotFound", "The specified quiz was not found."));
        }

        if (existingQuiz.OwnerId.Value != request.UserId)
        {
            return Result<Guid>.Failure(
                new Error("Quiz.Unauthorized", "You do not have permission to version this quiz."));
        }

        if (existingQuiz.Status != QuizStatus.Published)
        {
            return Result<Guid>.Failure(
                new Error("Quiz.NotPublished", "Only a published quiz can be versioned."));
        }

        var newQuizVersion = existingQuiz.CreateNextVersion();

        await _repository.AddAsync(newQuizVersion);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result<Guid>.Success(newQuizVersion.Id);
    }
}
