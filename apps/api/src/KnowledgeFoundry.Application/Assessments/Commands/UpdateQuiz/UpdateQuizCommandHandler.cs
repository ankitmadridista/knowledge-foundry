using KnowledgeFoundry.Application.Abstractions.Persistence;
using KnowledgeFoundry.Application.Common.Results;
using KnowledgeFoundry.Domain.Assessments.Enums;
using KnowledgeFoundry.Domain.Assessments.ValueObjects;
using MediatR;

namespace KnowledgeFoundry.Application.Assessments.Commands.UpdateQuiz;

public sealed class UpdateQuizCommandHandler
    : IRequestHandler<UpdateQuizCommand, Result>
{
    private readonly IQuizRepository _repository;
    private readonly IUnitOfWork _unitOfWork;

    public UpdateQuizCommandHandler(
        IQuizRepository repository,
        IUnitOfWork unitOfWork)
    {
        _repository = repository;
        _unitOfWork = unitOfWork;
    }

    public async Task<Result> Handle(
        UpdateQuizCommand request,
        CancellationToken cancellationToken)
    {
        var quiz = await _repository.GetByIdAsync(request.Id, cancellationToken);

        if (quiz is null)
        {
            return Result.Failure(
                new Error("Quiz.NotFound", "The specified quiz was not found."));
        }

        if (quiz.Status != QuizStatus.Review)
        {
            return Result.Failure(
                new Error("Quiz.NotInReview", "Only quizzes in the Review state can be edited."));
        }

        quiz.UpdateTitle(request.Title);
        quiz.ClearQuestions();

        foreach (var qDto in request.Questions)
        {
            var type = Enum.TryParse<QuestionType>(qDto.Type, true, out var parsedType)
                ? parsedType
                : QuestionType.MultipleChoice;

            var question = quiz.AddQuestion(
                new QuestionText(qDto.Text),
                type,
                qDto.Explanation);

            foreach (var optDto in qDto.Options)
            {
                question.AddOption(
                    new OptionText(optDto.Text),
                    optDto.IsCorrect);
            }
        }

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result.Success();
    }
}
