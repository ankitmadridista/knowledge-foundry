namespace KnowledgeFoundry.AIPlatform.Exceptions;

/// <summary>
/// Thrown when an AI execution request fails the Zero-Trust Free-Tier Verification Gate.
/// </summary>
public sealed class AiAuthorizationException : Exception
{
    public AiAuthorizationException(string message)
        : base(message)
    {
    }

    public AiAuthorizationException(string message, Exception innerException)
        : base(message, innerException)
    {
    }
}
