using KnowledgeFoundry.Domain.Common.Base;
using KnowledgeFoundry.Domain.PromptTemplates.Enums;

namespace KnowledgeFoundry.Domain.PromptTemplates.ValueObjects;

public sealed class PromptMessage : ValueObject
{
    public PromptMessageRole Role { get; }

    public string Content { get; }

    public int Order { get; }

    public PromptMessage(
        PromptMessageRole role,
        string content,
        int order)
    {
        if (!Enum.IsDefined(typeof(PromptMessageRole), role))
        {
            throw new ArgumentException(
                "Invalid prompt message role.",
                nameof(role));
        }

        if (string.IsNullOrWhiteSpace(content))
        {
            throw new ArgumentException(
                "Prompt message content cannot be empty.",
                nameof(content));
        }

        if (order < 0)
        {
            throw new ArgumentOutOfRangeException(
                nameof(order),
                "Prompt message order cannot be negative.");
        }

        Role = role;
        Content = content.Trim();
        Order = order;
    }

    protected override IEnumerable<object?> GetEqualityComponents()
    {
        yield return Role;
        yield return Content;
        yield return Order;
    }
}
