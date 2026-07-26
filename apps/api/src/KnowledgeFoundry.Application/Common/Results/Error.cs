namespace KnowledgeFoundry.Application.Common.Results;

public sealed record Error(
    string Code,
    string Message)
{
    public static readonly Error None =
        new("None", "No error.");

    public override string ToString()
        => $"{Code}: {Message}";
}
