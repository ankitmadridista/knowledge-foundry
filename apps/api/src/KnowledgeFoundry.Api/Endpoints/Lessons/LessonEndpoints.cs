using KnowledgeFoundry.Application.Common.Errors;
using KnowledgeFoundry.Application.Lessons.Commands.DeleteLesson;
using KnowledgeFoundry.Application.Lessons.Commands.GenerateLesson;
using KnowledgeFoundry.Application.Lessons.Commands.UpdateLessonContent;
using KnowledgeFoundry.Application.Lessons.Queries.GetLessonById;
using KnowledgeFoundry.Application.Lessons.Queries.GetLessons;
using KnowledgeFoundry.Domain.PromptTemplates.Enums;
using MediatR;

namespace KnowledgeFoundry.Api.Endpoints.Lessons;

// --- API Contracts ---

public sealed record GenerateLessonRequest(
    string Title,
    string Topic,
    string Audience,
    Guid PromptTemplateId,
    Guid? ContextPackId,
    int? Provider = null,
    string? Model = null,
    Guid? CriticPromptTemplateId = null,
    int? CriticProvider = null,
    string? CriticModel = null);

public sealed record UpdateLessonContentRequest(
    string NewContent);

// --- Endpoints ---

public static class LessonEndpoints
{
    public static void MapLessonEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/lessons")
            .WithTags("Lessons")
            .RequireAuthorization();

        // Generation
        group.MapPost("/generate", GenerateLesson);

        // Queries
        group.MapGet("/", GetLessons);

        group.MapGet("/{id:guid}", GetLessonById)
            .WithName("GetLesson");

        // Mutations
        group.MapPut("/{id:guid}/content", UpdateLessonContent);

        group.MapDelete("/{id:guid}", DeleteLesson);
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
            request.ContextPackId,
            request.Provider.HasValue ? (AiProvider)request.Provider.Value : null,
            request.Model,
            request.CriticPromptTemplateId,
            request.CriticProvider.HasValue ? (AiProvider)request.CriticProvider.Value : null,
            request.CriticModel);

        var result = await sender.Send(command, cancellationToken);

        if (result.IsFailure)
        {
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
        int? pageNumber,
        int? pageSize,
        string? search,
        int? status,
        ISender sender,
        CancellationToken cancellationToken)
    {
        // Pass the parameters, falling back to defaults if they aren't in the URL
        var query = new GetLessonsQuery(
            pageNumber ?? 1,
            pageSize ?? 6,
            search,
            status);

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

    private static async Task<IResult> UpdateLessonContent(
        Guid id,
        UpdateLessonContentRequest request,
        ISender sender,
        CancellationToken cancellationToken)
    {
        var command = new UpdateLessonContentCommand(id, request.NewContent);
        var result = await sender.Send(command, cancellationToken);

        if (result.IsFailure)
        {
            if (result.Error == LessonErrors.NotFound)
                return Results.NotFound(result.Error);

            if (result.Error == LessonErrors.NotCompleted)
                return Results.BadRequest(result.Error); // Can't edit generating/failed lessons

            return Results.BadRequest(result.Error);
        }

        return Results.NoContent(); // 204 No Content is standard for a successful PUT
    }

    private static async Task<IResult> DeleteLesson(
        Guid id,
        ISender sender,
        CancellationToken cancellationToken)
    {
        var command = new DeleteLessonCommand(id);
        var result = await sender.Send(command, cancellationToken);

        if (result.IsFailure)
        {
            if (result.Error == LessonErrors.NotFound)
                return Results.NotFound(result.Error);

            return Results.BadRequest(result.Error);
        }

        return Results.NoContent();
    }
}
