using KnowledgeFoundry.Application.Common.Errors;
using KnowledgeFoundry.Application.Common.Models;
using KnowledgeFoundry.Application.PromptExecutions.Commands.ExecutePrompt;
using KnowledgeFoundry.Application.PromptTemplates.Commands.ActivatePromptVersion;
using KnowledgeFoundry.Application.PromptTemplates.Commands.CreatePromptTemplate;
using KnowledgeFoundry.Application.PromptTemplates.Commands.CreatePromptVersion;
using KnowledgeFoundry.Application.PromptTemplates.Commands.PublishPromptVersion;
using KnowledgeFoundry.Application.PromptTemplates.Queries.GetActivePromptPayload;
using KnowledgeFoundry.Application.PromptTemplates.Queries.GetPromptTemplate;
using KnowledgeFoundry.Application.PromptTemplates.Queries.GetPromptTemplates;
using KnowledgeFoundry.Application.PromptTemplates.Queries.GetPromptVersion;
using KnowledgeFoundry.Domain.PromptTemplates.Enums;
using MediatR;

namespace KnowledgeFoundry.Api.Endpoints.PromptTemplates;

// --- API Contracts ---

public sealed record CreatePromptTemplateRequest(
    string Identifier,
    string Name,
    string Description,
    PromptPurpose Purpose,
    string[] Tags);

public sealed record PromptMessageRequest(
    PromptMessageRole Role,
    string Content,
    int Order);

public sealed record CreatePromptVersionRequest(
    PromptMessageRequest[] Messages,
    PromptCapability Capability);

public sealed record ExecutePromptRequest(
    Dictionary<string, string> Variables);

// --- Endpoints ---

public static class PromptTemplateEndpoints
{
    public static void MapPromptTemplateEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/prompt-templates")
            .WithTags("Prompt Templates");

        group.MapPost("/", CreatePromptTemplate);

        group.MapGet("/{id:guid}", GetPromptTemplate)
            .WithName("GetPromptTemplate");

        group.MapPost("/{id:guid}/versions", CreatePromptVersion);

        group.MapPost("/{id:guid}/versions/{versionNumber:int}/publish", PublishPromptVersion);
        group.MapPost("/{id:guid}/versions/{versionNumber:int}/activate", ActivatePromptVersion);

        group.MapGet("/{identifier}/active-payload", GetActivePromptPayload);

        group.MapPost("/{identifier}/execute", ExecutePrompt);

        group.MapGet("/", GetPromptTemplates);

        group.MapGet("{id:guid}/versions/{versionNumber:int}", GetPromptVersion)
            .WithName("GetPromptVersion"); ;
    }

    private static async Task<IResult> CreatePromptTemplate(
        CreatePromptTemplateRequest request,
        ISender sender,
        CancellationToken cancellationToken)
    {
        var command = new CreatePromptTemplateCommand(
            request.Identifier,
            request.Name,
            request.Description,
            request.Purpose,
            request.Tags);

        var result = await sender.Send(command, cancellationToken);

        if (result.IsFailure)
        {
            return Results.BadRequest(result.Error);
        }

        return Results.CreatedAtRoute(
            routeName: "GetPromptTemplate",
            routeValues: new { id = result.Value },
            value: new { Id = result.Value });
    }

    private static async Task<IResult> GetPromptTemplate(
        Guid id,
        ISender sender,
        CancellationToken cancellationToken)
    {
        var query = new GetPromptTemplateQuery(id);
        var result = await sender.Send(query, cancellationToken);

        if (result.IsFailure)
        {
            if (result.Error == PromptTemplateErrors.NotFound)
                return Results.NotFound(result.Error);

            return Results.BadRequest(result.Error);
        }

        return Results.Ok(result.Value);
    }

    private static async Task<IResult> CreatePromptVersion(
        Guid id,
        CreatePromptVersionRequest request,
        ISender sender,
        CancellationToken cancellationToken)
    {
        var messages = request.Messages
            .Select(m => new PromptMessageDto(m.Role, m.Content, m.Order))
            .ToList();

        var command = new CreatePromptVersionCommand(id, messages, request.Capability);
        var result = await sender.Send(command, cancellationToken);

        if (result.IsFailure)
        {
            if (result.Error == PromptTemplateErrors.NotFound)
                return Results.NotFound(result.Error);

            return Results.BadRequest(result.Error);
        }

        return Results.Ok(new { VersionNumber = result.Value });
    }

    private static async Task<IResult> PublishPromptVersion(
        Guid id,
        int versionNumber,
        ISender sender,
        CancellationToken cancellationToken)
    {
        var command = new PublishPromptVersionCommand(id, versionNumber);
        var result = await sender.Send(command, cancellationToken);

        if (result.IsFailure)
        {
            if (result.Error == PromptTemplateErrors.NotFound)
                return Results.NotFound(result.Error);

            return Results.BadRequest(result.Error); // Could be a domain error (e.g. "already published")
        }

        return Results.NoContent();
    }

    private static async Task<IResult> ActivatePromptVersion(
        Guid id,
        int versionNumber,
        ISender sender,
        CancellationToken cancellationToken)
    {
        var command = new ActivatePromptVersionCommand(id, versionNumber);
        var result = await sender.Send(command, cancellationToken);

        if (result.IsFailure)
        {
            if (result.Error == PromptTemplateErrors.NotFound)
                return Results.NotFound(result.Error);

            return Results.BadRequest(result.Error); // Could be a domain error (e.g. "must be published first")
        }

        return Results.NoContent();
    }

    private static async Task<IResult> GetActivePromptPayload(
        string identifier,
        ISender sender,
        CancellationToken cancellationToken)
    {
        var query = new GetActivePromptPayloadQuery(identifier);
        var result = await sender.Send(query, cancellationToken);

        if (result.IsFailure)
        {
            return result.Error.Code == "PromptTemplate.NotFound"
                ? Results.NotFound(result.Error)
                : Results.BadRequest(result.Error);
        }

        return Results.Ok(result.Value);
    }

    private static async Task<IResult> ExecutePrompt(
        string identifier,
        ExecutePromptRequest request,
        ISender sender,
        CancellationToken cancellationToken)
    {
        var command = new ExecutePromptCommand(
            identifier,
            request.Variables ?? new Dictionary<string, string>());

        var result = await sender.Send(command, cancellationToken);

        if (result.IsFailure)
        {
            return Results.BadRequest(result.Error);
        }

        return Results.Ok(new { Response = result.Value });
    }

    private static async Task<IResult> GetPromptTemplates(
        int? pageNumber,
        int? pageSize,
        ISender sender,
        CancellationToken cancellationToken)
    {
        var query = new GetPromptTemplatesQuery(pageNumber ?? 1, pageSize ?? 12);
        var result = await sender.Send(query, cancellationToken);

        if (result.IsFailure)
        {
            return Results.BadRequest(result.Error);
        }

        return Results.Ok(result.Value);
    }

    private static async Task<IResult> GetPromptVersion(
        Guid id,
        int versionNumber,
        ISender sender,
        CancellationToken cancellationToken)
    {
        var query = new GetPromptVersionQuery(id, versionNumber);
        var result = await sender.Send(query, cancellationToken);

        if (result.IsFailure)
        {
            return Results.BadRequest(result.Error);
        }

        return Results.Ok(result.Value);
    }
}
