namespace KnowledgeFoundry.Application.Common.Results;

public class Result<T> : Result
{
    private Result(T value)
        : base(true, null)
    {
        Value = value;
    }

    private Result(string error)
        : base(false, error)
    {
    }

    public T? Value { get; }

    public static Result<T> Success(T value)
        => new(value);

    public new static Result<T> Failure(string error)
        => new(error);
}