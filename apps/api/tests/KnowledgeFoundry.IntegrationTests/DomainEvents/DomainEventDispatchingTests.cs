using KnowledgeFoundry.Domain.PromptTemplates.Enums;
using KnowledgeFoundry.Domain.PromptTemplates.Events;
using KnowledgeFoundry.Domain.PromptTemplates.ValueObjects;
using KnowledgeFoundry.IntegrationTests.Infrastructure;
using MediatR;
using Microsoft.Extensions.DependencyInjection;
using Shouldly;
using KnowledgeFoundry.Domain.PromptTemplates.Events;
using MediatR;

namespace KnowledgeFoundry.IntegrationTests.DomainEvents;

[Collection("Integration tests")]
public sealed class DomainEventDispatchingTests
{
    private readonly IntegrationTestFixture _fixture;

    public DomainEventDispatchingTests(
        IntegrationTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_not_clear_domain_events_when_dispatch_fails()
    {
        var template = PromptTemplate.Create(
            "PT-FAIL-001",
            "Failure Test",
            "Tests domain event failure handling",
            PromptPurpose.LessonGeneration);

        var version = template.CreateVersion(
            new[]
            {
                new PromptMessage(
                    PromptMessageRole.System,
                    "Test prompt",
                    1)
            },
            PromptCapability.GeneralChat);

        template.PublishVersion(version.VersionNumber);

        template.DomainEvents
            .ShouldHaveSingleItem();

        using var serviceProvider =
            _fixture.CreateServiceProvider(services =>
            {
                services.AddTransient<
                    INotificationHandler<PromptVersionPublishedDomainEvent>,
                    ThrowingPromptVersionPublishedDomainEventHandler>();
            });

        using var scope =
            serviceProvider.CreateScope();

        var repository =
            scope.ServiceProvider
                .GetRequiredService<
                    KnowledgeFoundry.Application.Abstractions.Persistence
                        .IPromptTemplateRepository>();

        await repository.AddAsync(
            template,
            CancellationToken.None);

        var exception =
            await Assert.ThrowsAsync<InvalidOperationException>(
                () => repository.SaveChangesAsync(
                    CancellationToken.None));

        exception.Message
            .ShouldBe("Test handler failure.");

        template.DomainEvents
            .ShouldHaveSingleItem();
    }
}
