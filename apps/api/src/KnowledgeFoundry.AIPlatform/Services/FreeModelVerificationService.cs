using KnowledgeFoundry.AIPlatform.Models;
using KnowledgeFoundry.AIPlatform.Policies;
using KnowledgeFoundry.Domain.PromptTemplates.Enums;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace KnowledgeFoundry.AIPlatform.Services;

internal sealed class FreeModelVerificationService : IFreeModelVerificationService
{
    private readonly IMemoryCache _cache;
    private readonly IEnumerable<IFreeModelPolicy> _policies;
    private readonly ILogger<FreeModelVerificationService> _logger;
    private readonly TimeSpan _cacheTtl;

    public FreeModelVerificationService(
        IMemoryCache cache,
        IEnumerable<IFreeModelPolicy> policies,
        IConfiguration configuration,
        ILogger<FreeModelVerificationService> logger)
    {
        _cache = cache;
        _policies = policies;
        _logger = logger;

        // Configurable TTL (defaulting to 300 seconds / 5 minutes)
        var ttlSeconds = configuration.GetValue<int>("AiSafety:FreeModelVerificationTtlSeconds", 300);
        _cacheTtl = TimeSpan.FromSeconds(ttlSeconds);
    }

    public async Task<FreeModelResult> VerifyModelAsync(AiProvider provider, string modelId, CancellationToken cancellationToken = default)
    {
        // 1. Sanity check inputs
        if (string.IsNullOrWhiteSpace(modelId))
        {
            _logger.LogWarning("Security Gate: Rejected empty model ID for provider {Provider}", provider);
            return FreeModelResult.Unknown;
        }

        var cacheKey = $"ai:free-model-verify:{provider}:{modelId.ToLowerInvariant()}";

        // 2. Check the short-lived cache to prevent API spam
        if (_cache.TryGetValue<FreeModelResult>(cacheKey, out var cachedResult))
        {
            _logger.LogDebug("Security Gate: Cache hit for {Provider}:{ModelId} -> {Result}", provider, modelId, cachedResult);
            return cachedResult;
        }

        // 3. Cache Miss: Find the specific policy for this provider
        var policy = _policies.FirstOrDefault(p => p.Provider == provider);
        if (policy == null)
        {
            _logger.LogError("Security Gate: No free-tier policy found for provider {Provider}. Failing closed.", provider);
            return FreeModelResult.Unknown;
        }

        // 4. Evaluate the strict provider policy
        _logger.LogInformation("Security Gate: Evaluating policy for {Provider}:{ModelId}", provider, modelId);
        var result = await policy.EvaluateAsync(modelId, cancellationToken);

        // 5. Cache the result to prevent hammering the provider APIs
        var cacheOptions = new MemoryCacheEntryOptions
        {
            AbsoluteExpirationRelativeToNow = _cacheTtl
        };
        _cache.Set(cacheKey, result, cacheOptions);

        if (result != FreeModelResult.Free)
        {
            _logger.LogWarning("Security Gate: Model {ModelId} on {Provider} evaluated as {Result}. Execution will be blocked.", modelId, provider, result);
        }

        return result;
    }
}
