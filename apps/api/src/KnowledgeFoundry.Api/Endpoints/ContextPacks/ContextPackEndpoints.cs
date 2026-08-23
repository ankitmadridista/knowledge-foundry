using KnowledgeFoundry.Application.Common.Errors;
using KnowledgeFoundry.Application.ContextPacks.Commands.ActivateContextVersion;
using KnowledgeFoundry.Application.ContextPacks.Commands.CreateContextPack;
using KnowledgeFoundry.Application.ContextPacks.Commands.CreateContextVersion;
using KnowledgeFoundry.Application.ContextPacks.Commands.PublishContextVersion;
using KnowledgeFoundry.Application.ContextPacks.Queries.GetActiveContextPackPayload;
using KnowledgeFoundry.Application.ContextPacks.Queries.GetContextPack;
using KnowledgeFoundry.Application.ContextPacks.Queries.GetContextPacks;
using KnowledgeFoundry.Application.ContextPacks.Queries.GetContextPackVersion;
using KnowledgeFoundry.Application.DomainModels;
using MediatR;

namespace KnowledgeFoundry.Api.Endpoints.ContextPacks;

// --- API Contracts ---

public sealed record CreateContextPackRequest(
    string Identifier,
    string Name,
    string Description,
    string[]? Tags);

public sealed record ContextSectionRequest(
    string Title,
    string Content,
    int Order);

public sealed record CreateContextPackVersionRequest(
    ContextSectionRequest[] Sections);


// --- Endpoints ---

public static class ContextPackEndpoints
{
    public static void MapContextPackEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/context-packs")
            .WithTags("Context Packs");

        group.MapPost("/", CreateContextPack);

        group.MapGet("/", GetContextPacks);

        group.MapGet("/{id:guid}", GetContextPack)
            .WithName("GetContextPack");

        group.MapPost("/{id:guid}/versions", CreateContextPackVersion);

        group.MapPost("/{id:guid}/versions/{versionNumber:int}/publish", PublishContextPackVersion);

        group.MapPost("/{id:guid}/versions/{versionNumber:int}/activate", ActivateContextPackVersion);

        group.MapGet("/{id:guid}/versions/{versionNumber:int}", GetContextPackVersion)
            .WithName("GetContextPackVersion");

        group.MapGet("/{identifier}/active-payload", GetActiveContextPackPayload);
    }

    private static async Task<IResult> CreateContextPack(
        CreateContextPackRequest request,
        ISender sender,
        CancellationToken cancellationToken)
    {
        var command = new CreateContextPackCommand(
            request.Identifier,
            request.Name,
            request.Description,
            request.Tags);

        var result = await sender.Send(command, cancellationToken);

        if (result.IsFailure)
        {
            if (result.Error == ContextPackErrors.IdentifierNotUnique)
                return Results.Conflict(result.Error);

            return Results.BadRequest(result.Error);
        }

        return Results.CreatedAtRoute(
            routeName: "GetContextPack",
            routeValues: new { id = result.Value },
            value: new { Id = result.Value });
    }

    private static async Task<IResult> GetContextPacks(
        int? pageNumber,
        int? pageSize,
        ISender sender,
        string? search,
        CancellationToken cancellationToken)
    {
        var query = new GetContextPacksQuery(pageNumber ?? 1, pageSize ?? 12, search);
        var result = await sender.Send(query, cancellationToken);

        if (result.IsFailure)
        {
            return Results.BadRequest(result.Error);
        }

        return Results.Ok(result.Value);
    }

    private static async Task<IResult> GetContextPack(
        Guid id,
        ISender sender,
        CancellationToken cancellationToken)
    {
        var query = new GetContextPackQuery(id);
        var result = await sender.Send(query, cancellationToken);

        if (result.IsFailure)
        {
            if (result.Error == ContextPackErrors.NotFound)
                return Results.NotFound(result.Error);

            return Results.BadRequest(result.Error);
        }

        return Results.Ok(result.Value);
    }

    private static async Task<IResult> CreateContextPackVersion(
        Guid id,
        CreateContextPackVersionRequest request,
        ISender sender,
        CancellationToken cancellationToken)
    {
        var sections = request.Sections
            .Select(s => new ContextSectionDto(s.Title, s.Content, s.Order))
            .ToList();

        var command = new CreateContextVersionCommand(id, sections);
        var result = await sender.Send(command, cancellationToken);

        if (result.IsFailure)
        {
            if (result.Error == ContextPackErrors.NotFound)
                return Results.NotFound(result.Error);

            return Results.BadRequest(result.Error);
        }

        return Results.Ok(new { VersionNumber = result.Value });
    }

    private static async Task<IResult> PublishContextPackVersion(
        Guid id,
        int versionNumber,
        ISender sender,
        CancellationToken cancellationToken)
    {
        var command = new PublishContextVersionCommand(id, versionNumber);
        var result = await sender.Send(command, cancellationToken);

        if (result.IsFailure)
        {
            if (result.Error == ContextPackErrors.NotFound)
                return Results.NotFound(result.Error);

            return Results.BadRequest(result.Error);
        }

        return Results.NoContent();
    }

    private static async Task<IResult> ActivateContextPackVersion(
        Guid id,
        int versionNumber,
        ISender sender,
        CancellationToken cancellationToken)
    {
        var command = new ActivateContextVersionCommand(id, versionNumber);
        var result = await sender.Send(command, cancellationToken);

        if (result.IsFailure)
        {
            if (result.Error == ContextPackErrors.NotFound)
                return Results.NotFound(result.Error);

            return Results.BadRequest(result.Error);
        }

        return Results.NoContent();
    }

    private static async Task<IResult> GetContextPackVersion(
        Guid id,
        int versionNumber,
        ISender sender,
        CancellationToken cancellationToken)
    {
        var query = new GetContextPackVersionQuery(id, versionNumber);
        var result = await sender.Send(query, cancellationToken);

        if (result.IsFailure)
        {
            return Results.BadRequest(result.Error);
        }

        return Results.Ok(result.Value);
    }

    private static async Task<IResult> GetActiveContextPackPayload(
        string identifier,
        ISender sender,
        CancellationToken cancellationToken)
    {
        var query = new GetActiveContextPackPayloadQuery(identifier);
        var result = await sender.Send(query, cancellationToken);

        if (result.IsFailure)
        {
            if (result.Error == ContextPackErrors.NotFound)
                return Results.NotFound(result.Error);

            return Results.BadRequest(result.Error);
        }

        return Results.Ok(new { MarkdownContent = result.Value });
    }
}
