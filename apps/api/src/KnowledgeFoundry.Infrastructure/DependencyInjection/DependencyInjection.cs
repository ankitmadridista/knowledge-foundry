using KnowledgeFoundry.Application.Abstractions.Persistence;
using KnowledgeFoundry.Application.Abstractions.Services;
using KnowledgeFoundry.Application.BackgroundProcessing;
using KnowledgeFoundry.Infrastructure.BackgroundProcessing;
using KnowledgeFoundry.Infrastructure.CorrelationContext;
using KnowledgeFoundry.Infrastructure.DomainEvents;
using KnowledgeFoundry.Infrastructure.Identity;
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

        services.AddScoped<ILessonRepository, LessonRepository>();

        services.AddScoped<IDomainEventDispatcher, DomainEventDispatcher>();

        services.AddScoped<IDatabaseSeeder, DatabaseSeeder>();

        services.AddScoped<IAiExecutionLogRepository, AiExecutionLogRepository>();

        services.AddScoped<ICorpSettingsRepository, CorpSettingsRepository>();

        services.AddSingleton<ILessonGenerationQueue, LessonGenerationQueue>();

        services.AddScoped<ICorrelationIdContext, CorrelationIdContext>();

        services.AddHttpContextAccessor(); // Required to read the current HTTP request
        services.AddScoped<ICurrentUserContext, CurrentUserContext>();

        return services;
    }
}
