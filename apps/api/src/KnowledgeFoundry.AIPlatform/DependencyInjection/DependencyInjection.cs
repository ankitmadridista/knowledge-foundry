using Microsoft.Extensions.DependencyInjection;

namespace KnowledgeFoundry.AIPlatform;

public static class DependencyInjection
{
    public static IServiceCollection AddAIPlatform(
        this IServiceCollection services)
    {
        return services;
    }
}