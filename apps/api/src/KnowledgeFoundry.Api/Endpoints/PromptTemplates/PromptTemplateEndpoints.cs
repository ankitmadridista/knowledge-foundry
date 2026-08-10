using KnowledgeFoundry.Application.Common.Errors;
using KnowledgeFoundry.Application.PromptTemplates.Commands.CreatePromptTemplate;
using KnowledgeFoundry.Application.PromptTemplates.Commands.CreatePromptVersion;
using KnowledgeFoundry.Application.PromptTemplates.Queries.GetPromptTemplate;
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
            {
                return Results.NotFound(result.Error);
            }

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
        // Map API DTO to Application DTO
        var messages = request.Messages
            .Select(m => new PromptMessageDto(m.Role, m.Content, m.Order))
            .ToList();

        var command = new CreatePromptVersionCommand(
            id,
            messages,
            request.Capability);

        var result = await sender.Send(command, cancellationToken);

        if (result.IsFailure)
        {
            if (result.Error == PromptTemplateErrors.NotFound)
            {
                return Results.NotFound(result.Error);
            }

            return Results.BadRequest(result.Error);
        }

        // Return 200 OK with the newly generated version number
        return Results.Ok(new { VersionNumber = result.Value });
    }
}
