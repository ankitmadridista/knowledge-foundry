using KnowledgeFoundry.Domain.PromptTemplates;

namespace KnowledgeFoundry.Application.Abstractions.Persistence;

public interface IPromptTemplateRepository
{
    Task AddAsync(
        PromptTemplate template,
        CancellationToken cancellationToken);

    Task<PromptTemplate?> GetByIdAsync(
        Guid id,
        CancellationToken cancellationToken);

    Task<PromptTemplate?> GetByIdentifierAsync(
        string identifier,
        CancellationToken cancellationToken = default);

    Task<IReadOnlyList<PromptTemplate>> GetAllAsync(CancellationToken cancellationToken = default);

    Task<(IReadOnlyList<PromptTemplate> Items, int TotalCount)> GetPagedAsync(
        int pageNumber,
        int pageSize,
        string? searchTerm = null,
        int? provider = null,
        CancellationToken cancellationToken = default);


    Task<PromptTemplateVersion?> GetVersionAsync(
        Guid templateId,
        int versionNumber,
        CancellationToken cancellationToken);
}
