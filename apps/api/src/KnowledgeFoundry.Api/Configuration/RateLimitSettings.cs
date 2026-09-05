namespace KnowledgeFoundry.Api.Configuration;

public sealed class RateLimitSettings
{
    public const string SectionName = "RateLimiting";

    public TokenBucketSettings Standard { get; set; } = new();
    public TokenBucketSettings ExpensiveAi { get; set; } = new();
}

public sealed class TokenBucketSettings
{
    // Maximum number of tokens the bucket can hold (Burst capacity)
    public int TokenLimit { get; set; }

    // How many tokens are added back to the bucket each cycle
    public int TokensPerPeriod { get; set; }

    // How often the replenishment cycle occurs (in seconds)
    public int ReplenishmentPeriodInSeconds { get; set; }
}
