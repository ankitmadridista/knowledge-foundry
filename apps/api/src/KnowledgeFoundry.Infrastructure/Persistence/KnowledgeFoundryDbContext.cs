using KnowledgeFoundry.Infrastructure.DomainEvents;
using Microsoft.EntityFrameworkCore;

namespace KnowledgeFoundry.Infrastructure.Persistence;

public sealed class KnowledgeFoundryDbContext
    : DbContext
{
    private readonly IDomainEventDispatcher? _domainEventDispatcher;

    public KnowledgeFoundryDbContext(
        DbContextOptions<KnowledgeFoundryDbContext> options,
        IDomainEventDispatcher? domainEventDispatcher = null)
        : base(options)
    {
        _domainEventDispatcher = domainEventDispatcher;
    }

    public override async Task<int> SaveChangesAsync(
        CancellationToken cancellationToken = default)
    {
        var result =
            await base.SaveChangesAsync(cancellationToken);

        if (_domainEventDispatcher is not null)
        {
            await _domainEventDispatcher.DispatchAsync(
                this,
                cancellationToken);
        }

        return result;
    }

    public DbSet<PromptTemplate> PromptTemplates => Set<PromptTemplate>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.ApplyConfigurationsFromAssembly(
            typeof(KnowledgeFoundryDbContext).Assembly);

        base.OnModelCreating(modelBuilder);
    }
}
