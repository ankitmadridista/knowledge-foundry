using KnowledgeFoundry.Application.Abstractions.Persistence;
using KnowledgeFoundry.Infrastructure.DomainEvents;
using KnowledgeFoundry.Infrastructure.Persistence;
using KnowledgeFoundry.Infrastructure.Persistence.Repositories;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace KnowledgeFoundry.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        services.AddDbContext<KnowledgeFoundryDbContext>(options =>
            options.UseNpgsql(
                configuration.GetConnectionString("DefaultConnection")));

        services.AddScoped<IUnitOfWork>(sp =>
            sp.GetRequiredService<KnowledgeFoundryDbContext>());

        services.AddScoped<IPromptTemplateRepository, PromptTemplateRepository>();

        services.AddScoped<IContextPackRepository, ContextPackRepository>();

        services.AddScoped<IDomainEventDispatcher, DomainEventDispatcher>();

        services.AddScoped<IDatabaseSeeder, DatabaseSeeder>();

        return services;
    }
}
