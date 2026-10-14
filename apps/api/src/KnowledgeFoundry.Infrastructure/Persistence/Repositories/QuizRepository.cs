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

    public async Task<Quiz?> GetByIdAsync(
        Guid id,
        CancellationToken cancellationToken = default)
    {
        return await _dbContext.Quizzes
            .SingleOrDefaultAsync(q => q.Id == id, cancellationToken);
    }

    public async Task AddAsync(
        Quiz quiz,
        CancellationToken cancellationToken = default)
    {
        await _dbContext.Quizzes.AddAsync(quiz, cancellationToken);
    }
}
