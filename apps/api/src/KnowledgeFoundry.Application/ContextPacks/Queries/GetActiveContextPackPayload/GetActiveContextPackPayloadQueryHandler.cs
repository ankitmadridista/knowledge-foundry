using KnowledgeFoundry.Application.Abstractions.Persistence;
using KnowledgeFoundry.Application.Abstractions.Services;
using KnowledgeFoundry.Application.Common.Errors;
using KnowledgeFoundry.Application.Common.Results;
using KnowledgeFoundry.Domain.ContextPacks.Enums;
using KnowledgeFoundry.Domain.PromptTemplates.Enums;
using MediatR;
using Microsoft.Extensions.Configuration;
using System.Text;

namespace KnowledgeFoundry.Application.ContextPacks.Queries.GetActiveContextPackPayload;

public sealed class GetActiveContextPackPayloadQueryHandler
    : IRequestHandler<GetActiveContextPackPayloadQuery, Result<string>>
{
    private readonly IContextPackRepository _repository;
    private readonly ICorpSettingsRepository _settingsRepository;
    private readonly IEmbeddingService _embeddingService;
    private readonly IConfiguration _configuration;

    public GetActiveContextPackPayloadQueryHandler(
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

    public async Task<Result<string>> Handle(
        GetActiveContextPackPayloadQuery request,
        CancellationToken cancellationToken)
    {
        // 1. Fetch settings to check our feature toggle
        var settings = await _settingsRepository.GetSettingsAsync(cancellationToken);

        // 2. VECTOR RAG PATH (If toggled ON and we have something to search for)
        if (settings.IsSemanticRagEnabled && !string.IsNullOrWhiteSpace(request.SearchQuery))
        {
            var providerString = _configuration["Embeddings:DefaultProvider"] ?? "Gemini";
            var model = _configuration["Embeddings:DefaultModel"] ?? "text-embedding-004";
            var provider = Enum.TryParse<AiProvider>(providerString, true, out var p) ? p : AiProvider.Gemini;

            try
            {
                var telemetry = await _embeddingService.GenerateEmbeddingAsync(
                    request.SearchQuery,
                    provider,
                    model,
                    cancellationToken);

                var ragContext = await _repository.GetRelevantContextByIdentifierAsync(
                    request.Identifier,
                    telemetry.Vector,
                    maxTokens: 3000, // Budget 3k tokens for injected context
                    cancellationToken);

                if (!string.IsNullOrWhiteSpace(ragContext))
                {
                    return Result<string>.Success(ragContext);
                }
                // If RAG returns empty (e.g. no vectors processed yet), gracefully fall through to full-text
            }
            catch
            {
                // If the embedding provider fails, log it, and safely fall through to full-text fallback
            }
        }

        // ====================================================================
        // 3. FULL-TEXT FALLBACK PATH (Your original logic perfectly preserved)
        // ====================================================================
        var contextPack = await _repository.GetByIdentifierAsync(request.Identifier, cancellationToken);

        if (contextPack is null)
            return Result<string>.Failure(ContextPackErrors.NotFound);

        var activeVersion = contextPack.Versions
            .SingleOrDefault(v => v.Status == ContextPackStatus.Active);

        if (activeVersion is null)
            return Result<string>.Failure(new Error(
                "ContextPack.NoActiveVersion",
                $"The context pack '{request.Identifier}' does not have an Active version."));

        var sb = new StringBuilder();
        sb.AppendLine($"# Context: {contextPack.Name.Value}");
        sb.AppendLine();

        foreach (var section in activeVersion.Sections.OrderBy(s => s.Order))
        {
            sb.AppendLine($"## {section.Title}");
            sb.AppendLine(section.Content);
            sb.AppendLine();
        }

        return Result<string>.Success(sb.ToString().TrimEnd());
    }
}
