using KnowledgeFoundry.Application.Common.Results;

namespace KnowledgeFoundry.Application.Common.Errors;

public static class CommonErrors
{
    public static readonly Error Validation =
        new(
            "Common.Validation",
            "Validation failed.");

    public static readonly Error Unexpected =
        new(
            "Common.Unexpected",
            "An unexpected error occurred.");

    public static readonly Error NotFound =
        new(
            "Common.NotFound",
            "The requested resource was not found.");
}
