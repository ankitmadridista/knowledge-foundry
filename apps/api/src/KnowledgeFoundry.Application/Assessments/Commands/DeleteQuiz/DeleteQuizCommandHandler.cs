using KnowledgeFoundry.Application.Abstractions.Persistence;
using KnowledgeFoundry.Application.Common.Results;
using MediatR;

namespace KnowledgeFoundry.Application.Assessments.Commands.DeleteQuiz;

public sealed class DeleteQuizCommandHandler
    : IRequestHandler<DeleteQuizCommand, Result>
{
    private readonly IQuizRepository _repository;
    private readonly IUnitOfWork _unitOfWork;

    public DeleteQuizCommandHandler(
        IQuizRepository repository,
        IUnitOfWork unitOfWork)
    {
        _repository = repository;
        _unitOfWork = unitOfWork;
    }

    public async Task<Result> Handle(
        DeleteQuizCommand request,
        CancellationToken cancellationToken)
    {
        var quiz = await _repository.GetByIdAsync(request.Id, cancellationToken);

        if (quiz is null)
        {
            return Result.Failure(
                new Error("Quiz.NotFound", "The specified quiz was not found."));
        }

        _repository.Remove(quiz);

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result.Success();
    }
}
