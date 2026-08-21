using KnowledgeFoundry.AIPlatform;
using KnowledgeFoundry.Api.Endpoints.AiPlatform;
using KnowledgeFoundry.Api.Endpoints.ContextPacks;
using KnowledgeFoundry.Api.Endpoints.Lessons;
using KnowledgeFoundry.Api.Endpoints.PromptTemplates;
using KnowledgeFoundry.Api.Endpoints.Settings;
using KnowledgeFoundry.Api.Middleware;
using KnowledgeFoundry.Application.DependencyInjection;
using KnowledgeFoundry.Infrastructure;
using KnowledgeFoundry.Infrastructure.Persistence;

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
        policy.WithOrigins(
                "http://localhost:3000",       // Common Next.js/React local dev port
                "http://localhost:5173",       // Common Vite local dev port
                "https://*.vercel.app"         // Vercel deployment wildcard
            )
              .SetIsOriginAllowed(origin => true)
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

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
