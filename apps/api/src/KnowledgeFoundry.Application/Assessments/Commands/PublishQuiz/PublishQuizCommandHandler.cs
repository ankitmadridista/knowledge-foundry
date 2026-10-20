using KnowledgeFoundry.Application.Abstractions.Persistence;
using KnowledgeFoundry.Application.Common.Results;
using KnowledgeFoundry.Domain.Assessments.Enums;
using MediatR;

namespace KnowledgeFoundry.Application.Assessments.Commands.PublishQuiz;

public sealed class PublishQuizCommandHandler
    : IRequestHandler<PublishQuizCommand, Result>
{
    private readonly IQuizRepository _repository;
    private readonly IUnitOfWork _unitOfWork;

    public PublishQuizCommandHandler(
        IQuizRepository repository,
        IUnitOfWork unitOfWork)
    {
        _repository = repository;
        _unitOfWork = unitOfWork;
    }

    public async Task<Result> Handle(
        PublishQuizCommand request,
        CancellationToken cancellationToken)
    {
        var quiz = await _repository.GetByIdAsync(request.Id, cancellationToken);

        if (quiz is null)
        {
            return Result.Failure(
                new Error("Quiz.NotFound", "The specified quiz was not found."));
        }

        if (quiz.Status == QuizStatus.Published)
        {
            return Result.Failure(
                new Error("Quiz.AlreadyPublished", "This quiz is already published."));
        }

        if (quiz.Status != QuizStatus.Review)
        {
            return Result.Failure(
                new Error("Quiz.NotInReview", "Only quizzes in the Review state can be published."));
        }

        if (quiz.Questions.Count == 0)
        {
            return Result.Failure(
                new Error("Quiz.NoQuestions", "Cannot publish a quiz with no questions."));
        }

        quiz.Publish();

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result.Success();
    }
}
