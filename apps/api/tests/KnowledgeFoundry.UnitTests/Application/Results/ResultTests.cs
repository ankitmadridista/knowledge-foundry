using FluentAssertions;
using KnowledgeFoundry.Application.Common.Errors;
using KnowledgeFoundry.Application.Common.Results;
using KnowledgeFoundry.Tests.Fakes;

namespace KnowledgeFoundry.UnitTests.Application.Results
{
    public class ResultTests
    {
        [Fact]
        public void Success_should_have_no_error()
        {
            var result = Result.Success();

            result.IsSuccess.Should().BeTrue();
            result.Error.Should().Be(Error.None);
        }

        [Fact]
        public void Failure_should_contain_error()
        {
            var result =
                Result.Failure(CommonErrors.NotFound);

            result.IsFailure.Should().BeTrue();
            result.Error.Should().Be(CommonErrors.NotFound);
        }

        [Fact]
        public void Success_cannot_contain_error()
        {
            var action = () =>
                new FakeResult(
                    true,
                    CommonErrors.NotFound);

            action.Should()
                .Throw<ArgumentException>();
        }

        [Fact]
        public void Success_should_not_allow_null_value()
        {
            // Arrange
            var action = () => Result<string>.Success(null!);

            // Act & Assert
            action.Should().Throw<ArgumentNullException>();
        }
    }
}
