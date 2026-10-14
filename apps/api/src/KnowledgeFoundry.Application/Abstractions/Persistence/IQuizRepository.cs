using KnowledgeFoundry.Domain.Assessments;

namespace KnowledgeFoundry.Application.Abstractions.Persistence;

public interface IQuizRepository
{
    Task<Quiz?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task AddAsync(Quiz quiz, CancellationToken cancellationToken = default);
}
