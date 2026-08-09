using KnowledgeFoundry.Application.DependencyInjection;
using KnowledgeFoundry.Domain.PromptTemplates.Events;
using KnowledgeFoundry.Infrastructure;
using KnowledgeFoundry.Infrastructure.Persistence;
using KnowledgeFoundry.IntegrationTests.DomainEvents;
using MediatR;
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

            services.AddTransient<
                INotificationHandler<PromptVersionPublishedDomainEvent>,
                PromptVersionPublishedDomainEventHandlerSpy>();

            ServiceProvider = services.BuildServiceProvider();

            using var scope = ServiceProvider.CreateScope();

            var dbContext =
                scope.ServiceProvider.GetRequiredService<KnowledgeFoundryDbContext>();

            await dbContext.Database.MigrateAsync();

            dbContext.PromptTemplates.RemoveRange(
                await dbContext.PromptTemplates.ToListAsync());

            await dbContext.SaveChangesAsync();
        }

        public ServiceProvider CreateServiceProvider(
            Action<IServiceCollection>? configure = null)
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

            services.AddTransient<
                INotificationHandler<PromptVersionPublishedDomainEvent>,
                PromptVersionPublishedDomainEventHandlerSpy>();

            configure?.Invoke(services);

            return services.BuildServiceProvider();
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
