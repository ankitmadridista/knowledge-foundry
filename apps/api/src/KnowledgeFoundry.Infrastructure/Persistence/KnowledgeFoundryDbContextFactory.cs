using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
using Microsoft.Extensions.Configuration;

namespace KnowledgeFoundry.Infrastructure.Persistence;

public sealed class KnowledgeFoundryDbContextFactory
    : IDesignTimeDbContextFactory<KnowledgeFoundryDbContext>
{
    public KnowledgeFoundryDbContext CreateDbContext(string[] args)
    {
        var environment =
            Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT")
            ?? "Development";

        var configuration = new ConfigurationBuilder()
            .SetBasePath(Directory.GetCurrentDirectory())
            .AddJsonFile("appsettings.json", optional: false)
            .AddJsonFile("appsettings.Development.json", optional: true)
            .AddEnvironmentVariables()
            .Build();

        var connectionString =
            configuration.GetConnectionString("DefaultConnection")
            ?? throw new InvalidOperationException(
                "Connection string 'DefaultConnection' was not found.");

        var optionsBuilder =
            new DbContextOptionsBuilder<KnowledgeFoundryDbContext>();

        optionsBuilder.UseNpgsql(connectionString);

        return new KnowledgeFoundryDbContext(optionsBuilder.Options);
    }
}
