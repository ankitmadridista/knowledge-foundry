using KnowledgeFoundry.Application.Abstractions.Persistence;
using KnowledgeFoundry.Application.Common.Errors;
using KnowledgeFoundry.Application.Common.Results;
using MediatR;

namespace KnowledgeFoundry.Application.Lessons.Commands.DeleteLesson;

public sealed class DeleteLessonCommandHandler
    : IRequestHandler<DeleteLessonCommand, Result>
{
    private readonly ILessonRepository _repository;
    private readonly IUnitOfWork _unitOfWork;

    public DeleteLessonCommandHandler(
        ILessonRepository repository,
        IUnitOfWork unitOfWork)
    {
        _repository = repository;
        _unitOfWork = unitOfWork;
    }

    public async Task<Result> Handle(
        DeleteLessonCommand request,
        CancellationToken cancellationToken)
    {
        var lesson = await _repository.GetByIdAsync(request.Id, cancellationToken);

        if (lesson is null)
        {
            return Result.Failure(LessonErrors.NotFound);
        }

        _repository.Remove(lesson);

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result.Success();
    }
}
