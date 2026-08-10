using KnowledgeFoundry.Application.PromptTemplates.Commands.CreatePromptTemplate;
using KnowledgeFoundry.Application.PromptTemplates.Queries.GetPromptTemplate;
using KnowledgeFoundry.Domain.PromptTemplates.Enums;
using MediatR;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;

namespace KnowledgeFoundry.Api.Endpoints.PromptTemplates;

public sealed record CreatePromptTemplateRequest(
    string Identifier,
    string Name,
    string Description,
    PromptPurpose Purpose,
    string[] Tags);

public static class PromptTemplateEndpoints
{
    public static void MapPromptTemplateEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/prompt-templates")
            .WithTags("Prompt Templates");

        group.MapPost("/", CreatePromptTemplate);

        group.MapGet("/{id:guid}", GetPromptTemplate)
            .WithName("GetPromptTemplate"); // We name the route so CreatedAtRoute can find it
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

        // Return 201 Created with a Location header pointing to our new GET endpoint
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
            // Specifically check for our NotFound error to return a 404 Status Code
            if (result.Error.Code == "PromptTemplate.NotFound")
            {
                return Results.NotFound(result.Error);
            }

            return Results.BadRequest(result.Error);
        }

        return Results.Ok(result.Value);
    }
}
