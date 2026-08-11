using KnowledgeFoundry.AIPlatform;
using KnowledgeFoundry.Api.Endpoints.PromptTemplates;
using KnowledgeFoundry.Application.DependencyInjection;
using KnowledgeFoundry.Infrastructure;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

builder.Services
    .AddApplication()
    .AddAIPlatform()
    .AddInfrastructure(builder.Configuration);

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins(
                "http://localhost:3000",       // Common Next.js/React local dev port
                "http://localhost:5173",       // Common Vite local dev port
                "https://*.vercel.app"         // Vercel deployment wildcard (handled via pattern or explicit URLs)
            )
              .SetIsOriginAllowed(origin => true) // Handy for development: allows any origin dynamically
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

app.UseSwagger();
app.UseSwaggerUI(c =>
{
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "Knowledge Foundry API v1");
    c.RoutePrefix = string.Empty;
    c.EnableTryItOutByDefault();
});

//app.UseHttpsRedirection();

app.UseCors("AllowFrontend");

// Map our feature endpoints
app.MapPromptTemplateEndpoints();

// Apply database migrations automatically on startup
using (var scope = app.Services.CreateScope())
{
    var dbContext = scope.ServiceProvider.GetRequiredService<KnowledgeFoundry.Infrastructure.Persistence.KnowledgeFoundryDbContext>();
    dbContext.Database.Migrate();
}

app.Run();
