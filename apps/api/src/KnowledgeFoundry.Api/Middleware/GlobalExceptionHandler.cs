using KnowledgeFoundry.Application.Abstractions.Services;
using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Mvc;

namespace KnowledgeFoundry.Api.Middleware;

internal sealed class GlobalExceptionHandler : IExceptionHandler
{
    private readonly ILogger<GlobalExceptionHandler> _logger;

    public GlobalExceptionHandler(ILogger<GlobalExceptionHandler> logger)
    {
        _logger = logger;
    }

    public async ValueTask<bool> TryHandleAsync(
        HttpContext httpContext,
        Exception exception,
        CancellationToken cancellationToken)
    {
        var correlationContext = httpContext.RequestServices.GetRequiredService<ICorrelationIdContext>();
        var correlationId = correlationContext.CorrelationId;

        // 1. Log the actual exception. 
        // Note: Because we wrapped the pipeline in logger.BeginScope in our middleware, 
        // this log will AUTOMATICALLY include the CorrelationId!
        _logger.LogError(
            exception, "An unhandled exception occurred: {Message}", exception.Message);

        // 2. Format a safe, standardized ProblemDetails response for the frontend
        var problemDetails = new ProblemDetails
        {
            Status = StatusCodes.Status500InternalServerError,
            Title = "Server Error",
            Type = "https://datatracker.ietf.org/doc/html/rfc7231#section-6.6.1",
            Detail = "An unexpected error occurred while processing your request."
        };

        // 3. Attach BOTH the built-in TraceIdentifier and custom CorrelationId
        problemDetails.Extensions.Add("traceId", httpContext.TraceIdentifier);
        problemDetails.Extensions.Add("correlationId", correlationId);

        httpContext.Response.StatusCode = problemDetails.Status.Value;

        // 4. Write the JSON response
        await httpContext.Response.WriteAsJsonAsync(problemDetails, cancellationToken);

        return true;
    }
}
