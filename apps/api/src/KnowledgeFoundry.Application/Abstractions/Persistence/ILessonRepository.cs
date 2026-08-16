using KnowledgeFoundry.Domain.Lessons;

namespace KnowledgeFoundry.Application.Abstractions.Persistence;

public interface ILessonRepository
{
    Task AddAsync(
        Domain.Lessons.Lesson lesson,
        CancellationToken cancellationToken);

    Task<Domain.Lessons.Lesson?> GetByIdAsync(
        Guid id,
        CancellationToken cancellationToken);

    Task<IReadOnlyList<Domain.Lessons.Lesson>> GetAllAsync(
        CancellationToken cancellationToken = default);
}
