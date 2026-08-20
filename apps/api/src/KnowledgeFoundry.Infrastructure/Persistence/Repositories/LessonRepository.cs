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
        string? searchTerm = null,
        int? status = null,
        CancellationToken cancellationToken = default)
    {
        var query = _dbContext.Lessons.AsNoTracking();

        if (status.HasValue)
        {
            query = query.Where(x => (int)x.Status == status.Value);
        }

        if (!string.IsNullOrWhiteSpace(searchTerm))
        {
            var search = searchTerm.ToLower();

            query = query.Where(x =>
                x.Title.Value.ToLower().Contains(search) ||
                x.Topic.Value.ToLower().Contains(search) ||
                x.Audience.Value.ToLower().Contains(search)
            );
        }

        var totalCount = await query.CountAsync(cancellationToken);

        var items = await query
            .OrderByDescending(x => x.CreatedAt)
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);

        return (items, totalCount);
    }

    public void Remove(Lesson lesson)
    {
        _dbContext.Lessons.Remove(lesson);
    }
}
