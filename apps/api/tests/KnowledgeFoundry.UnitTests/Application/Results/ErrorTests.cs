using FluentAssertions;
using KnowledgeFoundry.Application.Common.Results;

namespace KnowledgeFoundry.UnitTests.Application.Results
{
    public class ErrorTests
    {
        [Fact]
        public void Errors_with_same_code_and_message_should_be_equal()
        {
            var left = new Error(
                "Common.NotFound",
                "Not found");

            var right = new Error(
                "Common.NotFound",
                "Not found");

            left.Should().Be(right);
        }
    }
}
