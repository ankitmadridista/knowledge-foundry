using KnowledgeFoundry.Application.Common.Results;

namespace KnowledgeFoundry.Application.Common.Errors;

public static class ContextPackErrors
{
    public static readonly Error NotFound = new(
        "ContextPack.NotFound",
        "The context pack with the specified identifier or ID was not found.");

    public static readonly Error IdentifierNotUnique = new(
        "ContextPack.IdentifierNotUnique",
        "A context pack with this identifier already exists.");
}
