using KnowledgeFoundry.Application.Abstractions.Persistence;
using KnowledgeFoundry.Application.Abstractions.Services;
using KnowledgeFoundry.Domain.ContextPacks;
using KnowledgeFoundry.Domain.ContextPacks.Enums;
using KnowledgeFoundry.Domain.PromptTemplates.Enums;
using Microsoft.Extensions.Configuration;
using System.Text;

namespace KnowledgeFoundry.Application.Services; // Adjust namespace as needed

internal sealed class ContextRetrievalService : IContextRetrievalService
{
    private readonly IContextPackRepository _repository;
    private readonly ICorpSettingsRepository _settingsRepository;
    private readonly IEmbeddingService _embeddingService;
    private readonly IConfiguration _configuration;

    public ContextRetrievalService(
        IContextPackRepository repository,
        ICorpSettingsRepository settingsRepository,
        IEmbeddingService embeddingService,
        IConfiguration configuration)
    {
        _repository = repository;
        _settingsRepository = settingsRepository;
        _embeddingService = embeddingService;
        _configuration = configuration;
    }

    public async Task<string> GetContextByIdAsync(Guid contextPackId, string searchQuery, CancellationToken cancellationToken = default)
    {
        var settings = await _settingsRepository.GetSettingsAsync(cancellationToken);

        if (settings.IsSemanticRagEnabled && !string.IsNullOrWhiteSpace(searchQuery))
        {
            var ragContext = await TryVectorSearchAsync(
                searchQuery,
                vector => _repository.GetRelevantContextAsync(contextPackId, vector, 3000, cancellationToken),
                cancellationToken);

            if (!string.IsNullOrWhiteSpace(ragContext)) return ragContext;
        }

        // Fallback
        var pack = await _repository.GetByIdAsync(contextPackId, cancellationToken);
        return BuildFallbackMarkdown(pack);
    }

    public async Task<string> GetContextByIdentifierAsync(string identifier, string searchQuery, CancellationToken cancellationToken = default)
    {
        var settings = await _settingsRepository.GetSettingsAsync(cancellationToken);

        if (settings.IsSemanticRagEnabled && !string.IsNullOrWhiteSpace(searchQuery))
        {
            var ragContext = await TryVectorSearchAsync(
                searchQuery,
                vector => _repository.GetRelevantContextByIdentifierAsync(identifier, vector, 3000, cancellationToken),
                cancellationToken);

            if (!string.IsNullOrWhiteSpace(ragContext)) return ragContext;
        }

        // Fallback
        var pack = await _repository.GetByIdentifierAsync(identifier, cancellationToken);
        return BuildFallbackMarkdown(pack);
    }

    // --- Private Shared Helpers ---

    private async Task<string?> TryVectorSearchAsync(string searchQuery, Func<float[], Task<string>> repositoryCall, CancellationToken cancellationToken)
    {
        try
        {
            var providerString = _configuration["Embeddings:DefaultProvider"] ?? "Gemini";
            var model = _configuration["Embeddings:DefaultModel"] ?? "text-embedding-004";
            var provider = Enum.TryParse<AiProvider>(providerString, true, out var p) ? p : AiProvider.Gemini;

            var telemetry = await _embeddingService.GenerateEmbeddingAsync(searchQuery, provider, model, cancellationToken);

            return await repositoryCall(telemetry.Vector);
        }
        catch
        {
            // Log failure here if desired
            return null; // Force fallback
        }
    }

    private static string BuildFallbackMarkdown(ContextPack? pack)
    {
        if (pack == null) return string.Empty;

        var activeVersion = pack.Versions.FirstOrDefault(v => v.Status == ContextPackStatus.Active);
        if (activeVersion == null) return string.Empty;

        var sb = new StringBuilder();
        sb.AppendLine($"# Context: {pack.Name.Value}");
        sb.AppendLine();

        foreach (var section in activeVersion.Sections.OrderBy(s => s.Order))
        {
            sb.AppendLine($"## {section.Title}");
            sb.AppendLine(section.Content);
            sb.AppendLine();
        }

        return sb.ToString().TrimEnd();
    }
}
