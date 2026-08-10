using KnowledgeFoundry.Application.Abstractions.Persistence;
using KnowledgeFoundry.Domain.PromptTemplates.Enums;
using KnowledgeFoundry.Domain.PromptTemplates.ValueObjects;
using KnowledgeFoundry.IntegrationTests.DomainEvents;
using KnowledgeFoundry.IntegrationTests.Infrastructure;
using Microsoft.Extensions.DependencyInjection;
using Shouldly;

namespace KnowledgeFoundry.IntegrationTests.Persistence
{
    [Collection("Integration tests")]
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
            PromptVersionPublishedDomainEventHandlerSpy.Reset();

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

            var unitOfWork = scope.ServiceProvider.GetRequiredService<IUnitOfWork>();

            await repository.AddAsync(
                template,
                CancellationToken.None);

            await unitOfWork.SaveChangesAsync(
                CancellationToken.None);

            var loaded =
                await repository.GetByIdAsync(
                    template.Id,
                    CancellationToken.None);

            loaded.ShouldNotBeNull();

            loaded.Identifier
                .ShouldBe(template.Identifier);

            loaded.Name
                .ShouldBe(template.Name);

            loaded.Purpose
                .ShouldBe(template.Purpose);

            loaded.Versions
                .Count.ShouldBe(1);

            var loadedVersion =
                loaded.Versions.Single();

            loadedVersion.Messages
                .Count.ShouldBe(2);

            loadedVersion.Messages
                .Select(x => x.Order)
                    .ShouldBe([1, 2]);

            loadedVersion.Messages
                .First()
                .Content
                .ShouldBe("You are a teacher.");

            loadedVersion.Messages
                .First()
                .Role
                .ShouldBe(PromptMessageRole.System);

            loadedVersion.Status
                .ShouldBe(PromptStatus.Published);

            PromptVersionPublishedDomainEventHandlerSpy.WasCalled
                .ShouldBeTrue();

        }

    }
}
