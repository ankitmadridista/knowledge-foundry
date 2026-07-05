namespace KnowledgeFoundry.Application.Abstractions.AI;

public interface ILLMClient
{
    Task<string> GenerateAsync(
        string prompt,
        CancellationToken cancellationToken = default);
}