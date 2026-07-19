using FluentAssertions;
using KnowledgeFoundry.Domain.PromptTemplates.ValueObjects;

namespace KnowledgeFoundry.UnitTests.PromptTemplates;

public class PromptVersionNumberTests
{
    [Fact]
    public void Next_should_increment_version()
    {
        var version = new PromptVersionNumber(1);

        var next = version.Next();

        next.Value.Should().Be(2);
    }

    [Fact]
    public void Should_throw_when_zero()
    {
        var action = () => new PromptVersionNumber(0);

        action.Should().Throw<ArgumentOutOfRangeException>();
    }

    [Fact]
    public void Should_format_as_v1()
    {
        var version = new PromptVersionNumber(1);

        version.ToString().Should().Be("v1");
    }
}
