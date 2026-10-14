using KnowledgeFoundry.Api.Extensions;
using KnowledgeFoundry.Application.Assessments.Commands.GenerateQuiz;
using KnowledgeFoundry.Application.Assessments.Queries.GetQuizById;
using KnowledgeFoundry.Application.Assessments.Queries.GetQuizzes;
using MediatR;

namespace KnowledgeFoundry.Api.Endpoints.Assessments;

// --- API Contracts ---

public sealed record GenerateQuizRequest(
    Guid LessonId,
    Guid PromptTemplateId,
    int QuestionCount = 5,
    string QuizFormat = "MultipleChoice",
    int? Provider = null,
    string? Model = null);

// --- Endpoints ---

public static class QuizEndpoints
{
    public static void MapQuizEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/quizzes")
            .WithTags("Quizzes")
            .RequireAuthorization()
            .RequireRateLimiting(RateLimiterExtensions.StandardPolicy);

        // Generation
        group.MapPost("/generate", GenerateQuiz)
            .RequireRateLimiting(RateLimiterExtensions.ExpensiveAiPolicy);

        // Queries
        group.MapGet("/", GetQuizzes);

        group.MapGet("/{id:guid}", GetQuizById)
            .WithName("GetQuiz");
    }

    private static async Task<IResult> GetQuizzes(
        int? pageNumber,
        int? pageSize,
        string? search,
        int? status,
        Guid? lessonId,
        ISender sender,
        CancellationToken cancellationToken)
    {
        var query = new GetQuizzesQuery(
            pageNumber ?? 1,
            pageSize ?? 6,
            search,
            status,
            lessonId);

        var result = await sender.Send(query, cancellationToken);

        if (result.IsFailure)
        {
            return Results.BadRequest(result.Error);
        }

        return Results.Ok(result.Value);
    }

    private static async Task<IResult> GetQuizById(
        Guid id,
        ISender sender,
        CancellationToken cancellationToken)
    {
        var query = new GetQuizByIdQuery(id);
        var result = await sender.Send(query, cancellationToken);

        if (result.IsFailure)
        {
            if (result.Error.Code == "Quiz.NotFound")
                return Results.NotFound(result.Error);

            return Results.BadRequest(result.Error);
        }

        return Results.Ok(result.Value);
    }

    private static async Task<IResult> GenerateQuiz(
        GenerateQuizRequest request,
        ISender sender,
        CancellationToken cancellationToken)
    {
        var command = new GenerateQuizCommand(
            request.LessonId,
            request.PromptTemplateId,
            request.QuestionCount,
            request.QuizFormat,
            request.Provider,
            request.Model);

        var result = await sender.Send(command, cancellationToken);

        if (result.IsFailure)
        {
            if (result.Error.Code is "Quiz.LessonNotFound" or "Quiz.TemplateNotFound")
            {
                return Results.NotFound(result.Error);
            }

            return Results.BadRequest(result.Error);
        }

        // Using Results.Created with a URI path for now; we can switch to CreatedAtRoute("GetQuiz", ...) 
        // right after we add the GetQuizById endpoint next.
        return Results.Created(
            $"/api/quizzes/{result.Value}",
            new { Id = result.Value });
    }
}
