using FluentAssertions;
using KnowledgeFoundry.Domain.PromptTemplates.ValueObjects;

namespace KnowledgeFoundry.UnitTests.PromptTemplates;

public class PromptTagTests
{
    [Fact]
    public void Should_trim_and_normalize_tag()
    {
        var tag = new PromptTag("  Education ");

        tag.Value.Should().Be("education");
    }

    [Fact]
    public void Equal_tags_should_be_equal()
    {
        var first = new PromptTag("Education");
        var second = new PromptTag("education");

        first.Should().Be(second);
    }

    [Fact]
    public void Should_throw_when_empty()
    {
        var action = () => new PromptTag("");

        action.Should().Throw<ArgumentException>();
    }
}
