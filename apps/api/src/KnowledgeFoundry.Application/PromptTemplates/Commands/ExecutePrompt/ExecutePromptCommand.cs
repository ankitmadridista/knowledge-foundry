using KnowledgeFoundry.Application.Common.Results;
using MediatR;

namespace KnowledgeFoundry.Application.PromptExecutions.Commands.ExecutePrompt;

public sealed record ExecutePromptCommand(
    string Identifier,
    Dictionary<string, string> Variables) : IRequest<Result<string>>;
