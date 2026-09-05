using KnowledgeFoundry.Api.Configuration;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using System.Threading.RateLimiting;

namespace KnowledgeFoundry.Api.Extensions;

public static class RateLimiterExtensions
{
    public const string StandardPolicy = "StandardPolicy";
    public const string ExpensiveAiPolicy = "ExpensiveAiPolicy";

    public static IServiceCollection AddKnowledgeFoundryRateLimiting(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        var settings = configuration
            .GetSection(RateLimitSettings.SectionName)
            .Get<RateLimitSettings>() ?? new RateLimitSettings();

        services.AddRateLimiter(options =>
        {
            // 1. Configure the 429 Rejection Behavior (RFC 7807 + Retry-After)
            options.OnRejected = async (context, token) =>
            {
                context.HttpContext.Response.StatusCode = StatusCodes.Status429TooManyRequests;

                if (context.Lease.TryGetMetadata(MetadataName.RetryAfter, out var retryAfter))
                {
                    context.HttpContext.Response.Headers.RetryAfter =
                        ((int)retryAfter.TotalSeconds).ToString();
                }

                var problemDetails = new ProblemDetails
                {
                    Status = StatusCodes.Status429TooManyRequests,
                    Title = "Too Many Requests",
                    Type = "https://httpstatuses.com/429",
                    Detail = "Rate limit exceeded. Please try again later."
                };

                // Matches the JSON shape emitted by your GlobalExceptionHandler
                await context.HttpContext.Response.WriteAsJsonAsync(problemDetails, token);
            };

            // 2. Standard CRUD Policy
            options.AddPolicy(StandardPolicy, context =>
            {
                // Key the partition by the Clerk JWT User ID. 
                // Fallback to "anonymous" to prevent crashes on unauthenticated routes.
                var userId = context.User.FindFirstValue(ClaimTypes.NameIdentifier) ?? "anonymous";

                return RateLimitPartition.GetTokenBucketLimiter(userId, _ => new TokenBucketRateLimiterOptions
                {
                    TokenLimit = settings.Standard.TokenLimit,
                    TokensPerPeriod = settings.Standard.TokensPerPeriod,
                    ReplenishmentPeriod = TimeSpan.FromSeconds(settings.Standard.ReplenishmentPeriodInSeconds),
                    QueueProcessingOrder = QueueProcessingOrder.OldestFirst,
                    QueueLimit = 0 // Enforces our ADR "Fail Fast" decision
                });
            });

            // 3. Expensive AI Policy
            options.AddPolicy(ExpensiveAiPolicy, context =>
            {
                var userId = context.User.FindFirstValue(ClaimTypes.NameIdentifier) ?? "anonymous";

                // ADR-007 Note: This is where you will eventually inspect context.User for a "Tier" claim
                // to conditionally swap these settings for Premium capacity constraints.

                return RateLimitPartition.GetTokenBucketLimiter(userId, _ => new TokenBucketRateLimiterOptions
                {
                    TokenLimit = settings.ExpensiveAi.TokenLimit,
                    TokensPerPeriod = settings.ExpensiveAi.TokensPerPeriod,
                    ReplenishmentPeriod = TimeSpan.FromSeconds(settings.ExpensiveAi.ReplenishmentPeriodInSeconds),
                    QueueProcessingOrder = QueueProcessingOrder.OldestFirst,
                    QueueLimit = 0
                });
            });
        });

        return services;
    }
}
