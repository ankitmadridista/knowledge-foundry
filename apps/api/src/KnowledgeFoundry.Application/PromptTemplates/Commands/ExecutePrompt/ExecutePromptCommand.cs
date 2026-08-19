using KnowledgeFoundry.Application.Abstractions.Services;
using KnowledgeFoundry.Application.Common.Results;
using KnowledgeFoundry.Domain.PromptTemplates.Enums;
using MediatR;

namespace KnowledgeFoundry.Application.PromptExecutions.Commands.ExecutePrompt;

public record ExecutePromptCommand(
    string Identifier,
    Dictionary<string, string> Variables,
    AiProvider? OverrideProvider = null,
    string? OverrideModel = null
) : IRequest<Result<ExecutionTelemetry>>;
