using KnowledgeFoundry.Application.Abstractions.Persistence;
using KnowledgeFoundry.Application.Common.Errors;
using KnowledgeFoundry.Application.PromptTemplates.Queries.GetPromptTemplate;
using KnowledgeFoundry.Domain.PromptTemplates.Enums;
using NSubstitute;
using Shouldly;
using System.Reflection;

namespace KnowledgeFoundry.UnitTests.PromptTemplates.Queries.GetPromptTemplate;

public class GetPromptTemplateQueryHandlerTests
{
    private readonly IPromptTemplateRepository _repositoryMock;
    private readonly GetPromptTemplateQueryHandler _handler;

    public GetPromptTemplateQueryHandlerTests()
    {
        _repositoryMock = Substitute.For<IPromptTemplateRepository>();
        _handler = new GetPromptTemplateQueryHandler(_repositoryMock);
    }

    [Fact]
    public async Task Handle_Should_Return_SuccessResult_With_Dto_When_Template_Exists()
    {
        // Arrange
        var query = new GetPromptTemplateQuery(Guid.NewGuid());

        var template = PromptTemplate.Create(
            "test-identifier",
            "Test Prompt",
            "Test Description",
            PromptPurpose.LessonGeneration,
            AiProvider.Groq,
            "llama-3.3-70b-versatile",
            new[] { "test" });

        _repositoryMock
            .GetByIdAsync(query.Id, Arg.Any<CancellationToken>())
            .Returns(template);

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.IsSuccess.ShouldBeTrue();
        result.Value.ShouldNotBeNull();

        result.Value.Id.ShouldBe(template.Id);
        result.Value.Identifier.ShouldBe("TEST-IDENTIFIER");
        result.Value.Name.ShouldBe("Test Prompt");
        result.Value.Description.ShouldBe("Test Description");
        result.Value.Purpose.ShouldBe(PromptPurpose.LessonGeneration);

        result.Value.Tags.ShouldNotBeNull();
        result.Value.Tags.ShouldHaveSingleItem();
        result.Value.Tags.ShouldContain("test");
    }

    [Fact]
    public async Task Handle_Should_Return_FailureResult_With_NotFoundError_When_Template_Does_Not_Exist()
    {
        // Arrange
        var query = new GetPromptTemplateQuery(Guid.NewGuid());

        _repositoryMock
            .GetByIdAsync(query.Id, Arg.Any<CancellationToken>())
            .Returns((PromptTemplate?)null);

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.IsFailure.ShouldBeTrue();
        result.Error.ShouldBe(PromptTemplateErrors.NotFound);

        // In our Result<T> implementation, Value is null on failure, it doesn't throw.
        result.Value.ShouldBeNull();
    }
}
