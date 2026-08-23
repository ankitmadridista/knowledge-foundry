using KnowledgeFoundry.Application.Abstractions.Persistence;
using KnowledgeFoundry.Application.Common.Errors;
using KnowledgeFoundry.Application.DomainModels;
using KnowledgeFoundry.Application.PromptTemplates.Commands.CreatePromptVersion;
using KnowledgeFoundry.Domain.PromptTemplates.Enums;
using NSubstitute;
using Shouldly;

namespace KnowledgeFoundry.UnitTests.PromptTemplates.Commands.CreatePromptVersion;

public class CreatePromptVersionCommandHandlerTests
{
    private readonly IPromptTemplateRepository _repositoryMock;
    private readonly IUnitOfWork _unitOfWorkMock;
    private readonly CreatePromptVersionCommandHandler _handler;

    public CreatePromptVersionCommandHandlerTests()
    {
        _repositoryMock = Substitute.For<IPromptTemplateRepository>();
        _unitOfWorkMock = Substitute.For<IUnitOfWork>();
        _handler = new CreatePromptVersionCommandHandler(_repositoryMock, _unitOfWorkMock);
    }

    [Fact]
    public async Task Handle_Should_Create_Version_And_Save_When_Template_Exists()
    {
        // Arrange
        var templateId = Guid.NewGuid();
        var template = PromptTemplate.Create(
            "test-prompt",
            "Test Prompt",
            "Description",
            PromptPurpose.LessonGeneration,
            AiProvider.Groq,
            "Groq",
            new[] { "test" });

        _repositoryMock
            .GetByIdAsync(templateId, Arg.Any<CancellationToken>())
            .Returns(template);

        var command = new CreatePromptVersionCommand(
            templateId,
            new List<PromptMessageDto>
            {
                new(PromptMessageRole.System, "You are a helpful assistant.", 1),
                new(PromptMessageRole.User, "Generate a lesson.", 2)
            },
            PromptCapability.GeneralChat);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.ShouldBeTrue();

        // Since this is the first version added to the template, it should be 1
        result.Value.ShouldBe(1);

        // Verify the domain model was actually updated
        template.Versions.Count.ShouldBe(1);
        var createdVersion = template.Versions.Single();
        createdVersion.Messages.Count.ShouldBe(2);
        createdVersion.Capability.ShouldBe(PromptCapability.GeneralChat);

        // Verify we committed the transaction
        await _unitOfWorkMock
            .Received(1)
            .SaveChangesAsync(Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task Handle_Should_Return_FailureResult_When_Template_Does_Not_Exist()
    {
        // Arrange
        var command = new CreatePromptVersionCommand(
            Guid.NewGuid(),
            new List<PromptMessageDto>(),
            PromptCapability.GeneralChat);

        _repositoryMock
            .GetByIdAsync(command.PromptTemplateId, Arg.Any<CancellationToken>())
            .Returns((PromptTemplate?)null);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsFailure.ShouldBeTrue();
        result.Error.ShouldBe(PromptTemplateErrors.NotFound);

        // Verify we DID NOT commit anything to the database
        await _unitOfWorkMock
            .DidNotReceive()
            .SaveChangesAsync(Arg.Any<CancellationToken>());
    }
}
