using KnowledgeFoundry.Application.Abstractions.Persistence;
using KnowledgeFoundry.Application.Common.Errors;
using KnowledgeFoundry.Application.Common.Results;
using KnowledgeFoundry.Domain.Lessons.Enums;
using MediatR;

namespace KnowledgeFoundry.Application.Lessons.Commands.UpdateLessonContent;

public sealed class UpdateLessonContentCommandHandler
    : IRequestHandler<UpdateLessonContentCommand, Result>
{
    private readonly ILessonRepository _repository;
    private readonly IUnitOfWork _unitOfWork;

    public UpdateLessonContentCommandHandler(
        ILessonRepository repository,
        IUnitOfWork unitOfWork)
    {
        _repository = repository;
        _unitOfWork = unitOfWork;
    }

    public async Task<Result> Handle(
        UpdateLessonContentCommand request,
        CancellationToken cancellationToken)
    {
        var lesson = await _repository.GetByIdAsync(request.Id, cancellationToken);

        if (lesson is null)
        {
            return Result.Failure(LessonErrors.NotFound);
        }

        // Return a clean error if they try to edit a generating/failed lesson
        if (lesson.Status != LessonStatus.Completed)
        {
            return Result.Failure(LessonErrors.NotCompleted);
        }

        lesson.UpdateContentManually(request.NewContent);

        // Ownership of the transaction is correctly delegated to the Unit of Work
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result.Success();
    }
}
