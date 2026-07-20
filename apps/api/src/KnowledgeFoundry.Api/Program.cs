using KnowledgeFoundry.AIPlatform;
using KnowledgeFoundry.Application.DependencyInjection;
using KnowledgeFoundry.Application.PromptTemplates.Commands.CreatePromptTemplate;
using KnowledgeFoundry.Domain.PromptTemplates.Enums;
using KnowledgeFoundry.Infrastructure;
using MediatR;

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

app.UseHttpsRedirection();

app.MapPost("/test-command", async (ISender sender) =>
{
    var id = await sender.Send(
        new CreatePromptTemplateCommand(
            "Lesson Generator",
            "Generates educational lessons",
            PromptPurpose.LessonGeneration,
            new[] { "education", "lesson" }));

    return Results.Ok(id);
});

app.Run();
