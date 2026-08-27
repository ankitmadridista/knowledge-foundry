using KnowledgeFoundry.AIPlatform.Models;
using KnowledgeFoundry.AIPlatform.Policies;
using KnowledgeFoundry.Application.Abstractions.Persistence;
using KnowledgeFoundry.Domain.PromptTemplates.Enums;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace KnowledgeFoundry.AIPlatform.Services;

internal sealed class FreeModelVerificationService : IFreeModelVerificationService
{
    private readonly IMemoryCache _cache;
    private readonly IEnumerable<IFreeModelPolicy> _policies;
    private readonly ICorpSettingsRepository _corpSettingsRepository;
    private readonly ILogger<FreeModelVerificationService> _logger;
    private readonly TimeSpan _cacheTtl;

    public FreeModelVerificationService(
        IMemoryCache cache,
        IEnumerable<IFreeModelPolicy> policies,
        ICorpSettingsRepository corpSettingsRepository,
        IConfiguration configuration,
        ILogger<FreeModelVerificationService> logger)
    {
        _cache = cache;
        _policies = policies;
        _corpSettingsRepository = corpSettingsRepository;
        _logger = logger;

        var ttlSeconds = configuration.GetValue<int>("AiSafety:FreeModelVerificationTtlSeconds", 300);
        _cacheTtl = TimeSpan.FromSeconds(ttlSeconds);
    }

    public async Task<FreeModelResult> VerifyModelAsync(AiProvider provider, string modelId, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(modelId)) return FreeModelResult.Unknown;

        var settings = await _corpSettingsRepository.GetSettingsAsync(cancellationToken);

        var modeStr = settings.EnableDynamicModelDiscovery ? "dynamic" : "offline";
        var cacheKey = $"ai:free-model-verify:{provider}:{modelId.ToLowerInvariant()}:{modeStr}";

        if (_cache.TryGetValue<FreeModelResult>(cacheKey, out var cachedResult)) return cachedResult;

        var policy = _policies.FirstOrDefault(p => p.Provider == provider);
        if (policy == null) return FreeModelResult.Unknown;

        var result = await policy.EvaluateAsync(modelId, settings.EnableDynamicModelDiscovery, cancellationToken);

        _cache.Set(cacheKey, result, new MemoryCacheEntryOptions { AbsoluteExpirationRelativeToNow = _cacheTtl });

        return result;
    }
}
