using KnowledgeFoundry.AIPlatform.Services;
using KnowledgeFoundry.Application.Abstractions.Services;
using Microsoft.Extensions.DependencyInjection;

namespace KnowledgeFoundry.AIPlatform;

public static class DependencyInjection
{
    public static IServiceCollection AddAIPlatform(
        this IServiceCollection services)
    {
        // Register the real AI service!
        services.AddScoped<IPromptExecutionService, GroqPromptExecutionService>();
        return services;
    }
}
