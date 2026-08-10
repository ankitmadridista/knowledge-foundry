using KnowledgeFoundry.AIPlatform;
using KnowledgeFoundry.Api.Endpoints.PromptTemplates;
using KnowledgeFoundry.Application.DependencyInjection;
using KnowledgeFoundry.Infrastructure;

var builder = WebApplication.CreateBuilder(args);

builder.Services
    .AddApplication()
    .AddAIPlatform()
    .AddInfrastructure(builder.Configuration);

builder.Services.AddOpenApi();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

//app.UseHttpsRedirection();

// Map our feature endpoints
app.MapPromptTemplateEndpoints();

app.Run();
