namespace KnowledgeFoundry.IntegrationTests.Infrastructure;

[CollectionDefinition("Integration tests")]
public sealed class IntegrationTestCollection
    : ICollectionFixture<IntegrationTestFixture>
{
}
