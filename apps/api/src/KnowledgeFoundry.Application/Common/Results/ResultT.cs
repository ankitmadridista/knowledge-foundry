namespace KnowledgeFoundry.Application.Common.Results;

public class Result<T> : Result
{
    private Result(T value)
    : base(true, Error.None)
    {
        ArgumentNullException.ThrowIfNull(value);

        Value = value;
    }

    private Result(Error error)
        : base(false, error)
    {
    }

    public T? Value { get; }

    public static Result<T> Success(T value)
        => new(value);

    public new static Result<T> Failure(Error error)
        => new(error);
}
