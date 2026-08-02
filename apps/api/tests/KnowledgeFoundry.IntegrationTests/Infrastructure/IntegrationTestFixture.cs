using KnowledgeFoundry.Application.DependencyInjection;
using KnowledgeFoundry.Infrastructure;
using KnowledgeFoundry.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace KnowledgeFoundry.IntegrationTests.Infrastructure
{
    public sealed class IntegrationTestFixture
    : IAsyncLifetime
    {
        public async Task InitializeAsync()
        {
            var configuration = new ConfigurationBuilder()
                .SetBasePath(AppContext.BaseDirectory)
                .AddJsonFile("appsettings.json", optional: false)
                .AddEnvironmentVariables()
                .Build();

            var services = new ServiceCollection();

            services
                .AddApplication()
                .AddInfrastructure(configuration);

            ServiceProvider = services.BuildServiceProvider();

            using var scope = ServiceProvider.CreateScope();

            var dbContext =
                scope.ServiceProvider.GetRequiredService<KnowledgeFoundryDbContext>();

            await dbContext.Database.MigrateAsync();

            dbContext.PromptTemplates.RemoveRange(
                await dbContext.PromptTemplates.ToListAsync());

            await dbContext.SaveChangesAsync();
        }

        public Task DisposeAsync()
        {
            return Task.CompletedTask;
        }

        public IServiceProvider ServiceProvider
        {
            get;
            private set;
        } = default!;
    }
}
