using KnowledgeFoundry.Application.Settings.Queries.GetConfig;
using MediatR;

namespace KnowledgeFoundry.Api.Endpoints.Settings;

public static class ConfigEndpoints
{
    public static void MapConfigEndpoints(this IEndpointRouteBuilder app)
    {
        // We'll put this under /api/config
        var group = app.MapGroup("/api/config")
            .WithTags("System Configuration");

        group.MapGet("/", GetConfig)
             .WithName("GetAppConfig");
    }

    private static async Task<IResult> GetConfig(
        ISender sender,
        CancellationToken cancellationToken)
    {
        var query = new GetAppConfigQuery();
        var result = await sender.Send(query, cancellationToken);

        if (result.IsFailure)
        {
            return Results.BadRequest(result.Error);
        }

        return Results.Ok(result.Value);
    }
}
