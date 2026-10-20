using KnowledgeFoundry.Domain.Assessments;

namespace KnowledgeFoundry.Application.Abstractions.Persistence;

public interface IQuizRepository
{
    Task AddAsync(Quiz quiz, CancellationToken cancellationToken = default);
    Task<Quiz?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<Quiz>> GetAllAsync(CancellationToken cancellationToken = default);
    Task<(IReadOnlyList<Quiz> Items, int TotalCount)> GetPagedAsync(
        int pageNumber,
        int pageSize,
        string? searchTerm = null,
        int? status = null,
        Guid? lessonId = null,
        CancellationToken cancellationToken = default);
    void Remove(Quiz quiz);
    Task<int> CountAsync(CancellationToken cancellationToken = default);
}
