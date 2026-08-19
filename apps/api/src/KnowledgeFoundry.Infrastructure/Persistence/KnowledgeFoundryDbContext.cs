using KnowledgeFoundry.Application.Abstractions.Persistence;
using KnowledgeFoundry.Domain.AiPlatform;
using KnowledgeFoundry.Domain.ContextPacks;
using KnowledgeFoundry.Domain.Lessons;
using KnowledgeFoundry.Infrastructure.DomainEvents;
using Microsoft.EntityFrameworkCore;

namespace KnowledgeFoundry.Infrastructure.Persistence;

public sealed class KnowledgeFoundryDbContext
    : DbContext, IUnitOfWork
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
        // 1. Dispatch events FIRST. 
        // This allows handlers to modify other entities and have them 
        // saved in the exact same database transaction!
        if (_domainEventDispatcher is not null)
        {
            await _domainEventDispatcher.DispatchAsync(
                this,
                cancellationToken);
        }

        // 2. THEN commit everything to the database
        var result = await base.SaveChangesAsync(cancellationToken);

        return result;
    }

    public DbSet<PromptTemplate> PromptTemplates => Set<PromptTemplate>();
    public DbSet<ContextPack> ContextPacks => Set<ContextPack>();
    public DbSet<Lesson> Lessons => Set<Lesson>();
    public DbSet<AiExecutionLog> AiExecutionLogs => Set<AiExecutionLog>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.ApplyConfigurationsFromAssembly(
            typeof(KnowledgeFoundryDbContext).Assembly);

        base.OnModelCreating(modelBuilder);
    }
}
