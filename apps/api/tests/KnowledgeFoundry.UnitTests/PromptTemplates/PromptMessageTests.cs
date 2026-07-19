using FluentAssertions;
using KnowledgeFoundry.Domain.PromptTemplates.Enums;
using KnowledgeFoundry.Domain.PromptTemplates.ValueObjects;

namespace KnowledgeFoundry.UnitTests.PromptTemplates;

public class PromptMessageTests
{
    [Fact]
    public void Should_create_prompt_message()
    {
        // Arrange & Act
        var message = new PromptMessage(
            PromptMessageRole.System,
            "You are a helpful assistant.",
            1);

        // Assert
        message.Role.Should().Be(PromptMessageRole.System);
        message.Content.Should().Be("You are a helpful assistant.");
        message.Order.Should().Be(1);
    }

    [Fact]
    public void Should_throw_when_content_is_empty()
    {
        // Arrange
        var action = () => new PromptMessage(
            PromptMessageRole.System,
            "",
            1);

        // Assert
        action.Should().Throw<ArgumentException>();
    }

    [Fact]
    public void Should_throw_when_order_is_negative()
    {
        // Arrange
        var action = () => new PromptMessage(
            PromptMessageRole.System,
            "Hello",
            -1);

        // Assert
        action.Should().Throw<ArgumentOutOfRangeException>();
    }
}
