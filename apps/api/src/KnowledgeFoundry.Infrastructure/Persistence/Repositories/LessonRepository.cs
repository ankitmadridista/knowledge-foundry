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

    public async Task<(IReadOnlyList<Lesson> Items, int TotalCount)> GetPagedAsync(
        int pageNumber,
        int pageSize,
        CancellationToken cancellationToken = default)
    {
        var query = _dbContext.Lessons.AsNoTracking();

        // 1. Get the total number of records (Extremely fast in SQL)
        var totalCount = await query.CountAsync(cancellationToken);

        // 2. Fetch only the specific page of data
        var items = await query
            .OrderByDescending(x => x.CreatedAt)
            .Skip((pageNumber - 1) * pageSize) // e.g. Page 2 of 10 items skips the first 10
            .Take(pageSize)                    // and takes the next 10
            .ToListAsync(cancellationToken);

        return (items, totalCount);
    }

    public void Remove(Lesson lesson)
    {
        _dbContext.Lessons.Remove(lesson);
    }
}
