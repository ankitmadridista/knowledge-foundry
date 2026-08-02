using KnowledgeFoundry.Application.Abstractions.Persistence;
using KnowledgeFoundry.Domain.PromptTemplates.Enums;
using KnowledgeFoundry.Domain.PromptTemplates.ValueObjects;
using KnowledgeFoundry.IntegrationTests.Infrastructure;
using Microsoft.Extensions.DependencyInjection;
using FluentAssertions;

namespace KnowledgeFoundry.IntegrationTests.Persistence
{
    [Collection("IntegrationTests")]
    public class PromptTemplateRepositoryTests
    {
        private readonly IntegrationTestFixture _fixture;
        public PromptTemplateRepositoryTests(IntegrationTestFixture fixture)
        {
            _fixture = fixture;
        }

        [Fact]
        public async Task Should_persist_complete_prompt_template_aggregate()
        {
            var template = PromptTemplate.Create(
                "PT-000001",
                "Lesson Generator",
                "Creates lessons",
                PromptPurpose.LessonGeneration,
                ["education"]);

            var version = template.CreateVersion(
                    new[]
                    {
                        new PromptMessage(
                            PromptMessageRole.System,
                            "You are a teacher.",
                            1),

                        new PromptMessage(
                            PromptMessageRole.User,
                            "Teach me gravity.",
                            2)
                    },
                    PromptCapability.GeneralChat);

            template.PublishVersion(version.VersionNumber);

            using var scope = _fixture.ServiceProvider.CreateScope();

            var repository =
                scope.ServiceProvider.GetRequiredService<IPromptTemplateRepository>();

            await repository.AddAsync(
                template,
                CancellationToken.None);

            await repository.SaveChangesAsync(
                CancellationToken.None);

            var loaded =
                await repository.GetByIdAsync(
                    template.Id,
                    CancellationToken.None);

            loaded.Should().NotBeNull();

            loaded.Identifier
                .Should()
                .Be(template.Identifier);

            loaded.Name
                .Should()
                .Be(template.Name);

            loaded.Purpose
                .Should()
                .Be(template.Purpose);

            loaded.Versions
                .Should()
                .HaveCount(1);

            var loadedVersion =
                loaded.Versions.Single();

            loadedVersion.Messages
                .Should()
                .HaveCount(2);

            loadedVersion.Messages
                .Select(x => x.Order)
                .Should()
                .ContainInOrder(1, 2);

            loadedVersion.Messages
                .First()
                .Content
                .Should()
                .Be("You are a teacher.");

            loadedVersion.Messages
                .First()
                .Role
                .Should()
                .Be(PromptMessageRole.System);

            loadedVersion.Status
                .Should()
                .Be(PromptStatus.Published);

        }

    }
}
