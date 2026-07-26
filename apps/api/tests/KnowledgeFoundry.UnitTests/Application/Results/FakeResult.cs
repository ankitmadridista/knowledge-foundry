using KnowledgeFoundry.Application.Common.Results;

namespace KnowledgeFoundry.Tests.Fakes;

public sealed class FakeResult : Result
{
    public FakeResult(
        bool isSuccess,
        Error? error)
        : base(isSuccess, error)
    {
    }
}
