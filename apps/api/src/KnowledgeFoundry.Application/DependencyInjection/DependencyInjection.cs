using KnowledgeFoundry.Application.Abstractions.Services;
using KnowledgeFoundry.Infrastructure.Services;
using Microsoft.Extensions.DependencyInjection;

namespace KnowledgeFoundry.Application.DependencyInjection;

public static class DependencyInjection
{
    public static IServiceCollection AddApplication(
        this IServiceCollection services)
    {
        services.AddMediatR(cfg =>
            cfg.RegisterServicesFromAssembly(
                typeof(DependencyInjection).Assembly));

        services.AddScoped<IPromptExecutionService, MockPromptExecutionService>();

        return services;
    }
}
