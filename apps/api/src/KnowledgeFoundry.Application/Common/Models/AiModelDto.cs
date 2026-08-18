namespace KnowledgeFoundry.Application.Common.Models;

public record AiModelDto(
    int ProviderId,
    string ProviderName,
    string ModelId
);
