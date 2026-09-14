using KnowledgeFoundry.Domain.ContextPacks;
using KnowledgeFoundry.Domain.ContextPacks.ValueObjects;
using KnowledgeFoundry.Domain.PromptTemplates.Enums;
using KnowledgeFoundry.Domain.PromptTemplates.ValueObjects;
using KnowledgeFoundry.Domain.Settings;
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
        await _context.Database.MigrateAsync();

        // 1. Seed CorpSettings with Semantic RAG Enabled!
        if (!await _context.CorpSettings.AnyAsync())
        {
            var defaultSettings = CorpSettings.Create(
                maxPromptTemplates: 25,
                maxContextPacks: 50,
                maxLessons: 50,
                enableDynamicModelDiscovery: false,
                isSemanticRagEnabled: true
            );

            await _context.CorpSettings.AddAsync(defaultSettings);
            await _context.SaveChangesAsync();
        }

        if (!await _context.ContextPacks.AnyAsync())
        {
            await SeedContextPacksAsync();
        }

        if (!await _context.PromptTemplates.AnyAsync())
        {
            await SeedPromptTemplatesAsync();
        }

        // Because bioPack.PublishVersion() adds a Domain Event to the aggregate, 
        // calling SaveChangesAsync here will trigger the event dispatcher, 
        // instantly queuing this pack into the background ContextIngestionWorker!
        await _context.SaveChangesAsync();
    }

    private async Task SeedContextPacksAsync()
    {
        var bioPack = ContextPack.Create(
            name: "Cellular Biology Fundamentals",
            identifier: "BIO-CELLS-101",
            description: "Core biological concepts covering cell structure, genetics, and energy.",
            tags: ["biology", "science", "cells"]
        );

        var bioVersion = bioPack.CreateVersion(
            sections:
            [
                new ContextSection(
                    title: "Cell Types and Organelles",
                    content: "# Cellular Biology Fundamentals\n\n## Types of Cells\nThere are two primary categories of cells:\n* **Prokaryotic Cells:** Simple, single-celled organisms without a nucleus (e.g., bacteria).\n* **Eukaryotic Cells:** Complex cells with a true nucleus and membrane-bound organelles (e.g., plant and animal cells).\n\n## Key Organelles in Eukaryotes\n1. **Nucleus:** The control center of the cell, containing the organism's DNA.\n2. **Mitochondria:** Often called the powerhouse of the cell, responsible for generating ATP energy through cellular respiration.\n3. **Ribosomes:** The cellular machines responsible for protein synthesis.\n\n> \"The cell is the fundamental structural and functional unit of life.\"",
                    order: 0
                ),
                // ADDED SECTIONS for better RAG vector isolation
                new ContextSection(
                    title: "Genetics and DNA",
                    content: "## Genetics\nDeoxyribonucleic acid (DNA) is the molecule that carries genetic instructions for the development, functioning, growth and reproduction of all known organisms. DNA is shaped like a double helix and is composed of four base pairs: Adenine (A), Thymine (T), Guanine (G), and Cytosine (C). A always pairs with T, and G always pairs with C.",
                    order: 1
                ),
                new ContextSection(
                    title: "Cellular Energy",
                    content: "## Cellular Energy\nPlants generate energy through Photosynthesis, converting sunlight, water, and carbon dioxide into glucose and oxygen. Animals generate energy through Cellular Respiration, which breaks down glucose using oxygen to create ATP (Adenosine Triphosphate), releasing carbon dioxide and water as byproducts.",
                    order: 2
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

        var evalTemplate = PromptTemplate.Create(
             name: "Standard JSON Evaluator",
             identifier: "EVAL-JSON-STD",
             description: "A strict LLM judge that evaluates lessons for accuracy and readability, returning ONLY raw JSON.",
             purpose: PromptPurpose.Evaluation,
             provider: AiProvider.Groq,
             model: "llama-3.3-70b-versatile",
             tags: ["evaluation", "system", "json"]
         );

        var evalVersion = evalTemplate.CreateVersion(
            [
                new PromptMessage(
                        role: PromptMessageRole.System,
                        content: "You are an expert educational evaluator. Your job is to grade the provided lesson draft. " +
                                 "You MUST respond with ONLY valid JSON matching this exact schema, with no additional markdown, text, or explanations:\n" +
                                 "{\n" +
                                 "  \"FactualAccuracyScore\": <integer 1-10>,\n" +
                                 "  \"ReadabilityScore\": <integer 1-10>,\n" +
                                 "  \"Feedback\": \"<string explaining the scores>\"\n" +
                                 "}",
                        order: 0),

                new PromptMessage(
                    role: PromptMessageRole.User,
                    content: "Please evaluate the following lesson content:\n\n{LessonContent}",
                    order: 1
                )
            ],
            PromptCapability.GeneralChat
        );

        evalTemplate.PublishVersion(evalVersion.VersionNumber);
        evalTemplate.ActivateVersion(evalVersion.VersionNumber);

        await _context.PromptTemplates.AddAsync(bioTemplate);
        await _context.PromptTemplates.AddAsync(evalTemplate);
    }
}
