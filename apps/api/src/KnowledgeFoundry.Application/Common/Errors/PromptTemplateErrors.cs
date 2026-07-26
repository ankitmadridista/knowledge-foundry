using KnowledgeFoundry.Application.Common.Results;

namespace KnowledgeFoundry.Application.Common.Errors;

public static class PromptTemplateErrors
{
    public static readonly Error NotFound =
        new(
            "PromptTemplate.NotFound",
            "Prompt template was not found.");

    public static readonly Error VersionNotFound =
        new(
            "PromptTemplate.VersionNotFound",
            "Prompt version was not found.");

    public static readonly Error VersionAlreadyPublished =
        new(
            "PromptTemplate.VersionAlreadyPublished",
            "The version has already been published.");

    public static readonly Error VersionMustBePublished =
        new(
            "PromptTemplate.VersionMustBePublished",
            "The version must be published before activation.");
}
