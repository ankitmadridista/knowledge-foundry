using KnowledgeFoundry.Domain.Common.Base;

namespace KnowledgeFoundry.Domain.ContextPacks.ValueObjects;

public sealed class ContextSection : ValueObject
{
    public string Title { get; }
    public string Content { get; }
    public int Order { get; }

    public ContextSection(string title, string content, int order)
    {
        if (string.IsNullOrWhiteSpace(title))
            throw new ArgumentException("Section title cannot be empty.", nameof(title));

        if (string.IsNullOrWhiteSpace(content))
            throw new ArgumentException("Section content cannot be empty.", nameof(content));

        if (order < 0)
            throw new ArgumentOutOfRangeException(nameof(order), "Section order cannot be negative.");

        Title = title.Trim();
        Content = content.Trim();
        Order = order;
    }

    protected override IEnumerable<object?> GetEqualityComponents()
    {
        yield return Title;
        yield return Content;
        yield return Order;
    }
}
