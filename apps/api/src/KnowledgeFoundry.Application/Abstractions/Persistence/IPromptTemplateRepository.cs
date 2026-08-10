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
}
