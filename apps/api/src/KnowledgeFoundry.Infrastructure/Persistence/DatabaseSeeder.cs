using KnowledgeFoundry.Domain.ContextPacks;
using KnowledgeFoundry.Domain.ContextPacks.ValueObjects;
using KnowledgeFoundry.Domain.PromptTemplates.Enums;
using KnowledgeFoundry.Domain.PromptTemplates.ValueObjects;
using Microsoft.EntityFrameworkCore;

namespace KnowledgeFoundry.Infrastructure.Persistence;

public class DatabaseSeeder : IDatabaseSeeder
{
    private readonly KnowledgeFoundryDbContext _context;

    public DatabaseSeeder(KnowledgeFoundryDbContext context)
    {
        _context = context;
    }

    public async Task SeedAsync()
    {
        // 1. Ensure the database is created and all migrations are applied.
        // This is magic for new devs: they don't even need to run 'dotnet ef database update'!
        await _context.Database.MigrateAsync();

        // 2. Check if we already have data. If we do, exit early.
        if (await _context.PromptTemplates.AnyAsync() || await _context.ContextPacks.AnyAsync())
        {
            return;
        }

        await SeedContextPacksAsync();
        await SeedPromptTemplatesAsync();

        // 3. Save all the new entities to the database!
        await _context.SaveChangesAsync();
    }

    private async Task SeedContextPacksAsync()
    {
        // ... [Existing WW2 Code] ...

        var bioPack = ContextPack.Create(
            name: "Cellular Biology Fundamentals",
            identifier: "BIO-CELLS-101",
            description: "Core biological concepts covering cell structure, types, and organelles.",
            tags: [ "biology", "science", "cells" ]
        );

        var bioVersion = bioPack.CreateVersion(
            sections:
            [
                new ContextSection(
                    title: "Cell Types and Organelles",
                    content: "# Cellular Biology Fundamentals\n\n## Types of Cells\nThere are two primary categories of cells:\n* **Prokaryotic Cells:** Simple, single-celled organisms without a nucleus (e.g., bacteria).\n* **Eukaryotic Cells:** Complex cells with a true nucleus and membrane-bound organelles (e.g., plant and animal cells).\n\n## Key Organelles in Eukaryotes\n1. **Nucleus:** The control center of the cell, containing the organism's DNA.\n2. **Mitochondria:** Often called the powerhouse of the cell, responsible for generating ATP energy through cellular respiration.\n3. **Ribosomes:** The cellular machines responsible for protein synthesis.\n\n> \"The cell is the fundamental structural and functional unit of life.\"",
                    order: 0
                )
            ]
        );

        bioPack.PublishVersion(bioVersion.VersionNumber);

        bioPack.ActivateVersion(bioVersion.VersionNumber);

        await _context.ContextPacks.AddAsync(bioPack);
    }

    private async Task SeedPromptTemplatesAsync()
    {

        var bioTemplate = PromptTemplate.Create(
             name: "Biology Lab Assistant",
             identifier: "BIO-ASSISTANT",
             description: "A friendly AI lab assistant that explains cellular biology concepts to students.",
             purpose: PromptPurpose.LessonGeneration,
             provider: AiProvider.Groq,
             model: "llama-3.3-70b-versatile",
             tags: ["biology", "tutor", "science"]
         );

        var bioVersion = bioTemplate.CreateVersion(
            [
                new PromptMessage(
                        role: PromptMessageRole.System,
                        content: "You are a friendly high school biology lab assistant. Your goal is to help students understand biological concepts clearly and accurately.\n\nYou must rely ONLY on the provided textbook context below. If the answer is not in the text, you must say: 'That is a great question, but we haven't covered that in the lab today!'\n\nTextbook Context:\n{Context:BIO-CELLS-101}\n\nFormat your answers with bullet points and bold text where appropriate.",
                        order: 0),

                new PromptMessage(
                    role: PromptMessageRole.User,
                    order:  1,
                    content: "Hi Lab Assistant! I'm confused about {Topic}. Can you explain it to me?"
                )

            ],
            PromptCapability.GeneralChat
        );

        bioTemplate.PublishVersion(bioVersion.VersionNumber);

        bioTemplate.ActivateVersion(bioVersion.VersionNumber);

        await _context.PromptTemplates.AddAsync(bioTemplate);
    }
}
