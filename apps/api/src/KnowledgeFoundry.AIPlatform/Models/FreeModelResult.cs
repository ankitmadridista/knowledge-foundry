namespace KnowledgeFoundry.AIPlatform.Models;

/// <summary>
/// Represents the strongly-typed authorization state of an AI model.
/// Unknown must ALWAYS be treated as non-executable.
/// </summary>
public enum FreeModelResult
{
    /// <summary>
    /// The model has been positively verified as completely free.
    /// </summary>
    Free = 1,

    /// <summary>
    /// The model has been positively verified as incurring costs.
    /// </summary>
    NotFree = 2,

    /// <summary>
    /// The free-tier status cannot be definitively proven (e.g., missing metadata, network error, parsing error).
    /// </summary>
    Unknown = 3
}
