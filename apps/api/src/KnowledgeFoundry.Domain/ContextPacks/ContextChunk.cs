namespace KnowledgeFoundry.Domain.ContextPacks;

public sealed class ContextChunk : Entity
{
    private ContextChunk() { } // EF Core

    public string SectionTitle { get; private set; } = null!;

    // The actual text slice
    public string Content { get; private set; } = null!;

    public float[] Embedding { get; private set; } = null!;

    public int TokenCount { get; private set; }
    public int OrderIndex { get; private set; }

    internal ContextChunk(
        string sectionTitle,
        string content,
        float[] embedding,
        int tokenCount,
        int orderIndex)
    {
        SectionTitle = sectionTitle;
        Content = content ?? throw new ArgumentNullException(nameof(content));
        Embedding = embedding ?? throw new ArgumentNullException(nameof(embedding));
        TokenCount = tokenCount;
        OrderIndex = orderIndex;
    }

    internal static ContextChunk Create(
        string sectionTitle,
        string content,
        float[] embedding,
        int tokenCount,
        int orderIndex)
    {
        return new ContextChunk(
            sectionTitle,
            content,
            embedding,
            tokenCount,
            orderIndex);
    }
}
