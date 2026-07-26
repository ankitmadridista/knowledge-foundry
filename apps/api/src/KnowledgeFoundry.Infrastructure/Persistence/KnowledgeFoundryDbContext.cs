using Microsoft.EntityFrameworkCore;

namespace KnowledgeFoundry.Infrastructure.Persistence;

public sealed class KnowledgeFoundryDbContext
    : DbContext
{
    public KnowledgeFoundryDbContext(
        DbContextOptions<KnowledgeFoundryDbContext> options)
        : base(options)
    {
    }

    public DbSet<PromptTemplate> PromptTemplates =>
        Set<PromptTemplate>();

    protected override void OnModelCreating(
        ModelBuilder modelBuilder)
    {
        modelBuilder.ApplyConfigurationsFromAssembly(
            typeof(KnowledgeFoundryDbContext).Assembly);

        base.OnModelCreating(modelBuilder);
    }
}
