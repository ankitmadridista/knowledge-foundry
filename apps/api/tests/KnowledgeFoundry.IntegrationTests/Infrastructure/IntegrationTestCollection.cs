namespace KnowledgeFoundry.IntegrationTests.Infrastructure;

[CollectionDefinition("IntegrationTests")]
public sealed class IntegrationTestCollection
    : ICollectionFixture<IntegrationTestFixture>
{
}
