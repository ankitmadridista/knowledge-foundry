using FluentAssertions;
using KnowledgeFoundry.Domain.Common.Exceptions;
using KnowledgeFoundry.Domain.PromptTemplates.Enums;
using KnowledgeFoundry.Domain.PromptTemplates.ValueObjects;

namespace KnowledgeFoundry.UnitTests.PromptTemplates;

public class PromptTemplateVersionTests
{
    private static PromptTemplate CreateTemplate()
    {
        return PromptTemplate.Create(
            "PT-000001",
            "Lesson Generator",
            "Generates educational lessons",
            PromptPurpose.LessonGeneration,
            AiProvider.Groq,
            "Groq",
            ["education"]);
    }

    private static IReadOnlyCollection<PromptMessage> CreateMessages()
    {
        return
        [
            new PromptMessage(
            PromptMessageRole.System,
            "You are an educational AI assistant.",
            1),

        new PromptMessage(
            PromptMessageRole.User,
            "Generate a lesson about Solar System.",
            2)
        ];
    }

    [Fact]
    public void New_version_should_start_as_draft()
    {
        // Arrange
        var template = CreateTemplate();

        // Act
        var version = template.CreateVersion(
            CreateMessages(),
            PromptCapability.GeneralChat);

        // Assert
        version.Status.Should().Be(PromptStatus.Draft);
    }

    [Fact]
    public void Should_require_at_least_one_message()
    {
        // Arrange
        var template = CreateTemplate();

        // Act
        var action = () => template.CreateVersion(
            Enumerable.Empty<PromptMessage>(),
            PromptCapability.GeneralChat);

        // Assert
        action.Should().Throw<DomainException>();
    }

    [Fact]
    public void Publish_should_change_status()
    {
        // Arrange
        var template = CreateTemplate();

        var version = template.CreateVersion(
            CreateMessages(),
            PromptCapability.GeneralChat);

        // Act
        template.PublishVersion(version.VersionNumber);

        // Assert
        version.Status.Should().Be(PromptStatus.Published);
        version.PublishedAt.Should().NotBeNull();
    }

    [Fact]
    public void Cannot_publish_twice()
    {
        // Arrange
        var template = CreateTemplate();

        var version = template.CreateVersion(
            CreateMessages(),
            PromptCapability.GeneralChat);

        template.PublishVersion(version.VersionNumber);

        // Act
        var action = () => template.PublishVersion(version.VersionNumber);

        // Assert
        action.Should().Throw<DomainException>("Version is already published.");
    }

    [Fact]
    public void Cannot_activate_draft()
    {
        // Arrange
        var template = CreateTemplate();

        var version = template.CreateVersion(
            CreateMessages(),
            PromptCapability.GeneralChat);

        // Act
        var action = () => template.ActivateVersion(version.VersionNumber);

        // Assert
        action.Should().Throw<DomainException>("Only published versions can be activated.");
    }

    [Fact]
    public void Archive_should_change_status()
    {
        // Arrange
        var template = CreateTemplate();

        var version = template.CreateVersion(
            CreateMessages(),
            PromptCapability.GeneralChat);

        template.PublishVersion(version.VersionNumber);

        template.ActivateVersion(version.VersionNumber);

        template.ArchiveVersion(version.VersionNumber);

        // Assert
        version.Status.Should().Be(PromptStatus.Archived);
        version.ArchivedAt.Should().NotBeNull();
    }

    [Fact]
    public void Activate_should_deactivate_previous_active_version()
    {
        var template = CreateTemplate();

        var version1 = template.CreateVersion(
            CreateMessages(),
            PromptCapability.GeneralChat);

        template.PublishVersion(version1.VersionNumber);
        template.ActivateVersion(version1.VersionNumber);

        var version2 = template.CreateVersion(
            CreateMessages(),
            PromptCapability.GeneralChat);

        template.PublishVersion(version2.VersionNumber);

        template.ActivateVersion(version2.VersionNumber);

        version1.Status.Should().Be(PromptStatus.Deprecated);

        version2.Status.Should().Be(PromptStatus.Active);
    }

    [Fact]
    public void Version_numbers_should_increment()
    {
        var template = CreateTemplate();

        var v1 = template.CreateVersion(
           CreateMessages(),
           PromptCapability.GeneralChat);

        var v2 = template.CreateVersion(
            CreateMessages(),
            PromptCapability.GeneralChat);

        v1.VersionNumber.Value.Should().Be(1);

        v2.VersionNumber.Value.Should().Be(2);
    }
}

