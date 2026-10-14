using KnowledgeFoundry.Application.Abstractions.Persistence;
using KnowledgeFoundry.Domain.Assessments;
using Microsoft.EntityFrameworkCore;

namespace KnowledgeFoundry.Infrastructure.Persistence.Repositories;

internal sealed class QuizRepository : IQuizRepository
{
    private readonly KnowledgeFoundryDbContext _dbContext;

    public QuizRepository(KnowledgeFoundryDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task AddAsync(
        Quiz quiz,
        CancellationToken cancellationToken = default)
    {
        await _dbContext.Quizzes.AddAsync(quiz, cancellationToken);
    }

    public async Task<Quiz?> GetByIdAsync(
        Guid id,
        CancellationToken cancellationToken = default)
    {
        return await _dbContext.Quizzes
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);
    }

    public async Task<IReadOnlyList<Quiz>> GetAllAsync(
        CancellationToken cancellationToken = default)
    {
        return await _dbContext.Quizzes
            .AsNoTracking()
            .OrderByDescending(x => x.CreatedAt)
            .ToListAsync(cancellationToken);
    }

    public async Task<(IReadOnlyList<Quiz> Items, int TotalCount)> GetPagedAsync(
        int pageNumber,
        int pageSize,
        string? searchTerm = null,
        int? status = null,
        Guid? lessonId = null,
        CancellationToken cancellationToken = default)
    {
        var query = _dbContext.Quizzes.AsNoTracking();

        if (lessonId.HasValue)
        {
            query = query.Where(x => x.LessonId == lessonId.Value);
        }

        if (status.HasValue)
        {
            query = query.Where(x => (int)x.Status == status.Value);
        }

        if (!string.IsNullOrWhiteSpace(searchTerm))
        {
            var search = searchTerm.ToLower();

            query = query.Where(x =>
                x.Title.Value.ToLower().Contains(search)
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

    public void Remove(Quiz quiz)
    {
        _dbContext.Quizzes.Remove(quiz);
    }

    public async Task<int> CountAsync(CancellationToken cancellationToken = default)
    {
        return await _dbContext.Quizzes.CountAsync(cancellationToken);
    }
}
