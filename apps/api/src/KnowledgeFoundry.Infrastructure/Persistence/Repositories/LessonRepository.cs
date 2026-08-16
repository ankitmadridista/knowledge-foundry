using KnowledgeFoundry.Application.Abstractions.Persistence;
using KnowledgeFoundry.Domain.Lessons;
using Microsoft.EntityFrameworkCore;

namespace KnowledgeFoundry.Infrastructure.Persistence.Repositories;

internal sealed class LessonRepository : ILessonRepository
{
    private readonly KnowledgeFoundryDbContext _dbContext;

    public LessonRepository(KnowledgeFoundryDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task AddAsync(
        Lesson lesson,
        CancellationToken cancellationToken)
    {
        await _dbContext.Lessons.AddAsync(
            lesson,
            cancellationToken);
    }

    public async Task<Lesson?> GetByIdAsync(
        Guid id,
        CancellationToken cancellationToken)
    {
        return await _dbContext.Lessons
            .FirstOrDefaultAsync(
                x => x.Id == id,
                cancellationToken);
    }

    public async Task<IReadOnlyList<Lesson>> GetAllAsync(
        CancellationToken cancellationToken)
    {
        return await _dbContext.Lessons
            .AsNoTracking()
            .OrderByDescending(x => x.CreatedAt)
            .ToListAsync(cancellationToken);
    }

    public void Remove(Lesson lesson)
    {
        _dbContext.Lessons.Remove(lesson);
    }
}
