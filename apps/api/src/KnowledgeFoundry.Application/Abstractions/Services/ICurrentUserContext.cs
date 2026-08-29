namespace KnowledgeFoundry.Application.Abstractions.Services;

public interface ICurrentUserContext
{
    string? UserId { get; }
    bool IsAuthenticated { get; }
}
