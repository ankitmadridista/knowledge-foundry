using KnowledgeFoundry.Api.Extensions;
using KnowledgeFoundry.Application.AiPlatform.Queries.GetAvailableModels;
using MediatR;

namespace KnowledgeFoundry.Api.Endpoints.AiPlatform;

public static class AiModelEndpoints
{
    public static void MapAiModelEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/ai-models")
            .WithTags("AI Platform")
            .RequireAuthorization()
            .RequireRateLimiting(RateLimiterExtensions.ExpensiveAiPolicy);

        group.MapGet("/", GetAvailableModels)
            .WithName("GetAvailableModels");
    }

    private static async Task<IResult> GetAvailableModels(
        ISender sender,
        CancellationToken cancellationToken)
    {
        var query = new GetAvailableModelsQuery();
        var result = await sender.Send(query, cancellationToken);

        if (result.IsFailure)
        {
            return Results.BadRequest(result.Error);
        }

        return Results.Ok(result.Value);
    }
}
