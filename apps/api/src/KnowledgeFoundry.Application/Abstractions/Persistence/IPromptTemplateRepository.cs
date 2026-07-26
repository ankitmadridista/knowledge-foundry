using KnowledgeFoundry.Domain.PromptTemplates;

namespace KnowledgeFoundry.Application.Abstractions.Persistence;

public interface IPromptTemplateRepository
    : IRepository<PromptTemplate>
{
    Task AddAsync(
        PromptTemplate template,
        CancellationToken cancellationToken);

    Task<PromptTemplate?> GetByIdAsync(
        Guid id,
        CancellationToken cancellationToken);

    Task<PromptTemplate?> GetByIdentifierAsync(
        string identifier,
        CancellationToken cancellationToken);
}
