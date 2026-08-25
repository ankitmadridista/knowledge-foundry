using KnowledgeFoundry.AIPlatform;
using KnowledgeFoundry.Api.Endpoints.AiPlatform;
using KnowledgeFoundry.Api.Endpoints.ContextPacks;
using KnowledgeFoundry.Api.Endpoints.Lessons;
using KnowledgeFoundry.Api.Endpoints.PromptTemplates;
using KnowledgeFoundry.Api.Endpoints.Settings;
using KnowledgeFoundry.Api.Middleware;
using KnowledgeFoundry.Api.Swagger;
using KnowledgeFoundry.Application.DependencyInjection;
using KnowledgeFoundry.Infrastructure;
using KnowledgeFoundry.Infrastructure.Persistence;
using Microsoft.Extensions.Configuration;

var builder = WebApplication.CreateBuilder(args);

builder.Services
    .AddApplication()
    .AddAIPlatform()
    .AddInfrastructure(builder.Configuration);

builder.Services.AddExceptionHandler<GlobalExceptionHandler>();
builder.Services.AddProblemDetails();

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        // Dynamically pull the origins from appsettings.json or Environment Variables
        var allowedOrigins = builder.Configuration.GetSection("CorsSettings:AllowedOrigins").Get<string[]>();

        if (allowedOrigins != null && allowedOrigins.Length > 0)
        {
            policy.WithOrigins(allowedOrigins)
                  .AllowAnyHeader()
                  .AllowAnyMethod();
        }
        else
        {
            Console.WriteLine("WARNING: No CORS AllowedOrigins found in configuration! API requests from the browser will fail.");
        }
    });
});

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.OperationFilter<CorrelationIdHeaderParameter>();
});

var app = builder.Build();

app.UseMiddleware<CorrelationIdMiddleware>();

app.UseExceptionHandler();

app.UseSwagger();
app.UseSwaggerUI(c =>
{
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "Knowledge Foundry API v1");
    c.RoutePrefix = string.Empty;
    c.EnableTryItOutByDefault();
});

//app.UseHttpsRedirection();

app.UseCors("AllowFrontend");

app.MapGet("/api/health", () => Results.Ok(new { status = "Healthy", timestamp = DateTime.UtcNow }))
   .WithTags("System")
   .ExcludeFromDescription();

// Map our feature endpoints
app.MapConfigEndpoints();
app.MapPromptTemplateEndpoints();
app.MapContextPackEndpoints();
app.MapLessonEndpoints();
app.MapAiModelEndpoints();

// Apply database migrations and seed data automatically on startup!
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    try
    {
        var seeder = services.GetRequiredService<IDatabaseSeeder>();
        await seeder.SeedAsync();
    }
    catch (Exception ex)
    {
        var logger = services.GetRequiredService<ILogger<Program>>();
        logger.LogError(ex, "An error occurred while migrating or seeding the database.");
    }
}

app.Run();
