using KnowledgeFoundry.Domain.Lessons;

namespace KnowledgeFoundry.Application.Abstractions.Persistence;

public interface ILessonRepository
{
    Task AddAsync(
        Lesson lesson,
        CancellationToken cancellationToken);

    Task<Lesson?> GetByIdAsync(
        Guid id,
        CancellationToken cancellationToken);

    Task<IReadOnlyList<Lesson>> GetAllAsync(
        CancellationToken cancellationToken = default);

    Task<(IReadOnlyList<Lesson> Items, int TotalCount)> GetPagedAsync(
        int pageNumber,
        int pageSize,
        CancellationToken cancellationToken = default);

    void Remove(Lesson lesson);
}
