using KnowledgeFoundry.Application.Common.Errors;
using KnowledgeFoundry.Application.Lessons.Commands.GenerateLesson;
using KnowledgeFoundry.Application.Lessons.Queries.GetLessonById;
using KnowledgeFoundry.Application.Lessons.Queries.GetLessons;
using MediatR;

namespace KnowledgeFoundry.Api.Endpoints.Lessons;

// --- API Contracts ---

public sealed record GenerateLessonRequest(
    string Title,
    string Topic,
    string Audience,
    Guid PromptTemplateId,
    Guid? ContextPackId);

// --- Endpoints ---

public static class LessonEndpoints
{
    public static void MapLessonEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/lessons")
            .WithTags("Lessons");

        group.MapPost("/generate", GenerateLesson);

        group.MapGet("/", GetLessons);

        group.MapGet("/{id:guid}", GetLessonById)
            .WithName("GetLesson");
    }

    private static async Task<IResult> GenerateLesson(
        GenerateLessonRequest request,
        ISender sender,
        CancellationToken cancellationToken)
    {
        var command = new GenerateLessonCommand(
            request.Title,
            request.Topic,
            request.Audience,
            request.PromptTemplateId,
            request.ContextPackId);

        var result = await sender.Send(command, cancellationToken);

        if (result.IsFailure)
        {
            // If the template or context pack was not found, return a 404
            if (result.Error == LessonErrors.TemplateNotFound ||
                result.Error == LessonErrors.ContextPackNotFound)
            {
                return Results.NotFound(result.Error);
            }

            return Results.BadRequest(result.Error);
        }

        return Results.CreatedAtRoute(
            routeName: "GetLesson",
            routeValues: new { id = result.Value },
            value: new { Id = result.Value });
    }

    private static async Task<IResult> GetLessons(
        ISender sender,
        CancellationToken cancellationToken)
    {
        var query = new GetLessonsQuery();
        var result = await sender.Send(query, cancellationToken);

        if (result.IsFailure)
        {
            return Results.BadRequest(result.Error);
        }

        return Results.Ok(result.Value);
    }

    private static async Task<IResult> GetLessonById(
        Guid id,
        ISender sender,
        CancellationToken cancellationToken)
    {
        var query = new GetLessonByIdQuery(id);
        var result = await sender.Send(query, cancellationToken);

        if (result.IsFailure)
        {
            if (result.Error == LessonErrors.NotFound)
                return Results.NotFound(result.Error);

            return Results.BadRequest(result.Error);
        }

        return Results.Ok(result.Value);
    }
}
