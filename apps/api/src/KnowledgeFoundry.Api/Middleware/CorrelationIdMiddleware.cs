using KnowledgeFoundry.Application.Abstractions.Services;
using Microsoft.Extensions.Primitives;

namespace KnowledgeFoundry.Api.Middleware;

public class CorrelationIdMiddleware
{
    private const string CorrelationIdHeaderName = "X-Correlation-ID";
    private readonly RequestDelegate _next;

    // Notice we do NOT inject ICorrelationIdContext here.
    // The constructor is called once (Singleton), but our context is Scoped!
    public CorrelationIdMiddleware(RequestDelegate next)
    {
        _next = next;
    }

    // Scoped dependencies must be injected into the InvokeAsync method.
    public async Task InvokeAsync(
        HttpContext context,
        ICorrelationIdContext correlationContext,
        ILogger<CorrelationIdMiddleware> logger)
    {
        // 1. Read the correlation ID from the request, or generate a new one
        var correlationId = GetOrGenerateCorrelationId(context);

        // 2. Set it in our scoped context so the Application layer can access it later
        correlationContext.SetCorrelationId(correlationId);

        // 3. Ensure the correlation ID is returned in the response headers.
        // We use OnStarting to guarantee the header is added right before the response is sent to the client,
        // avoiding "Headers are read-only" exceptions if downstream code writes to the body.
        context.Response.OnStarting(() =>
        {
            if (!context.Response.Headers.ContainsKey(CorrelationIdHeaderName))
            {
                context.Response.Headers.Append(CorrelationIdHeaderName, correlationId);
            }
            return Task.CompletedTask;
        });

        // 4. Push the Correlation ID into the logging scope.
        // Every logger.LogInformation() or logger.LogError() called after this point 
        // will automatically have the "CorrelationId" property attached to it in Serilog/AppInsights.
        using (logger.BeginScope(new Dictionary<string, object>
        {
            ["CorrelationId"] = correlationId
        }))
        {
            // 5. Pass execution to the next middleware (routing, controllers, etc.)
            await _next(context);
        }
    }

    private static string GetOrGenerateCorrelationId(HttpContext context)
    {
        if (context.Request.Headers.TryGetValue(CorrelationIdHeaderName, out StringValues correlationIds))
        {
            var id = correlationIds.FirstOrDefault();
            if (!string.IsNullOrWhiteSpace(id))
            {
                return id;
            }
        }

        // If the client didn't provide one, generate a fresh one
        return Guid.NewGuid().ToString();
    }
}
