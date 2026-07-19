using FluentAssertions;
using KnowledgeFoundry.Domain.PromptTemplates;
using KnowledgeFoundry.Domain.PromptTemplates.Enums;
using KnowledgeFoundry.Domain.PromptTemplates.ValueObjects;

namespace KnowledgeFoundry.UnitTests.PromptTemplates;

public class PromptTemplateVersionTests
{
    [Fact]
    public void New_version_should_start_as_draft()
    {
        var messages = new[]
        {
            new PromptMessage(
                PromptMessageRole.System,
                "System Prompt",
                1)
        };

        var version = new PromptTemplateVersion(
            new PromptVersionNumber(1),
            messages,
            PromptCapability.GeneralChat);

        version.Status.Should().Be(PromptStatus.Draft);
    }

    [Fact]
    public void Should_require_at_least_one_message()
    {
        var action = () => new PromptTemplateVersion(
            new PromptVersionNumber(1),
            Enumerable.Empty<PromptMessage>(),
            PromptCapability.GeneralChat);

        action.Should().Throw<ArgumentException>();
    }
}
