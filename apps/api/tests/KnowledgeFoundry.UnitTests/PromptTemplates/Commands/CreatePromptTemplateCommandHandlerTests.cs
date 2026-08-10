using KnowledgeFoundry.Application.Abstractions.Persistence;
using KnowledgeFoundry.Application.PromptTemplates.Commands.CreatePromptTemplate;
using KnowledgeFoundry.Domain.PromptTemplates.Enums;
using NSubstitute;
using Shouldly;

namespace KnowledgeFoundry.UnitTests.PromptTemplates.Commands.CreatePromptTemplate;

public class CreatePromptTemplateCommandHandlerTests
{
    private readonly IPromptTemplateRepository _repositoryMock;
    private readonly IUnitOfWork _unitOfWorkMock;
    private readonly CreatePromptTemplateCommandHandler _handler;

    public CreatePromptTemplateCommandHandlerTests()
    {
        _repositoryMock = Substitute.For<IPromptTemplateRepository>();
        _unitOfWorkMock = Substitute.For<IUnitOfWork>();
        _handler = new CreatePromptTemplateCommandHandler(_repositoryMock, _unitOfWorkMock);
    }

    [Fact]
    public async Task Handle_Should_Create_And_Persist_PromptTemplate_When_Request_Is_Valid()
    {
        // Arrange
        var command = new CreatePromptTemplateCommand(
            "test-identifier",
            "Test Prompt",
            "A description for the test prompt.",
            PromptPurpose.Evaluation,
            new[] { "test", "demo" });

        PromptTemplate? capturedTemplate = null;

        _repositoryMock
            .AddAsync(Arg.Any<PromptTemplate>(), Arg.Any<CancellationToken>())
            .Returns(Task.CompletedTask)
            .AndDoes(callInfo => capturedTemplate = callInfo.Arg<PromptTemplate>());

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.ShouldBeTrue();
        result.Value.ShouldNotBe(Guid.Empty);

        // Verify the Unit of Work committed the transaction
        await _unitOfWorkMock
            .Received(1)
            .SaveChangesAsync(CancellationToken.None);

        capturedTemplate.ShouldNotBeNull();

        // Note: Using the uppercase value you successfully debugged!
        capturedTemplate.Identifier.Value.ShouldBe("TEST-IDENTIFIER");
        capturedTemplate.Name.Value.ShouldBe("Test Prompt");
        capturedTemplate.Description.Value.ShouldBe("A description for the test prompt.");
        capturedTemplate.Purpose.ShouldBe(PromptPurpose.Evaluation);

        capturedTemplate.Tags.ShouldNotBeNull();
        capturedTemplate.Tags.Count.ShouldBe(2);
        capturedTemplate.Tags.Any(t => t.Value == "test").ShouldBeTrue();
        capturedTemplate.Tags.Any(t => t.Value == "demo").ShouldBeTrue();
    }
}
