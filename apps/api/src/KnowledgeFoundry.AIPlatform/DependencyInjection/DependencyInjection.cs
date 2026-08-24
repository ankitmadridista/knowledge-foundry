using KnowledgeFoundry.AIPlatform.Policies;
using KnowledgeFoundry.AIPlatform.Services;
using KnowledgeFoundry.Application.Abstractions.Services;
using Microsoft.Extensions.DependencyInjection;

namespace KnowledgeFoundry.AIPlatform;

public static class DependencyInjection
{
    public static IServiceCollection AddAIPlatform(
        this IServiceCollection services)
    {
        services.AddMemoryCache();

        services.AddScoped<IFreeModelPolicy, OpenRouterFreeModelPolicy>();
        services.AddScoped<IFreeModelPolicy, GroqFreeModelPolicy>();
        services.AddScoped<IFreeModelPolicy, GeminiFreeModelPolicy>();

        services.AddScoped<IFreeModelVerificationService, FreeModelVerificationService>();

        services.AddScoped<IPromptExecutionService, MultiModelExecutionService>();
        services.AddHttpClient<IAiModelDiscoveryService, AiModelDiscoveryService>();
        return services;
    }
}
