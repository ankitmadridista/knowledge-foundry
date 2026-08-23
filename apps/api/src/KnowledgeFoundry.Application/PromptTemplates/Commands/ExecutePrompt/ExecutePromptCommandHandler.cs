using KnowledgeFoundry.Application.Abstractions.Services;
using KnowledgeFoundry.Application.Common.Results;
using KnowledgeFoundry.Application.ContextPacks.Queries.GetActiveContextPackPayload;
using KnowledgeFoundry.Application.DomainModels;
using KnowledgeFoundry.Application.PromptTemplates.Queries.GetActivePromptPayload;
using MediatR;
using System.Text.RegularExpressions;

namespace KnowledgeFoundry.Application.PromptExecutions.Commands.ExecutePrompt;

public sealed class ExecutePromptCommandHandler
    : IRequestHandler<ExecutePromptCommand, Result<ExecutionTelemetry>>
{
    private readonly IMediator _mediator;
    private readonly IPromptExecutionService _executionService;

    public ExecutePromptCommandHandler(
        IMediator mediator,
        IPromptExecutionService executionService)
    {
        _mediator = mediator;
        _executionService = executionService;
    }

    public async Task<Result<ExecutionTelemetry>> Handle(
        ExecutePromptCommand request,
        CancellationToken cancellationToken)
    {
        // 1. Fetch the active prompt payload
        var payloadResult = await _mediator.Send(
            new GetActivePromptPayloadQuery(request.Identifier),
            cancellationToken);

        if (payloadResult.IsFailure) return Result<ExecutionTelemetry>.Failure(payloadResult.Error);

        var messages = payloadResult.Value.Messages.ToList();
        var injectedMessages = new List<MessagePayloadDto>();
        var contextRegex = new Regex(@"\{Context:([a-zA-Z0-9_-]+)\}", RegexOptions.IgnoreCase);

        // 2. Process each message
        foreach (var message in messages)
        {
            var content = message.Content;

            // --- CONTEXT PACK INJECTION ---
            var contextMatches = contextRegex.Matches(content);
            foreach (Match match in contextMatches)
            {
                var contextIdentifier = match.Groups[1].Value;
                var contextResult = await _mediator.Send(
                    new GetActiveContextPackPayloadQuery(contextIdentifier),
                    cancellationToken);

                if (contextResult.IsFailure)
                {
                    return Result<ExecutionTelemetry>.Failure(contextResult.Error);
                }

                content = content.Replace(match.Value, contextResult.Value);
            }

            // 3. Inject standard user variables
            foreach (var variable in request.Variables)
            {
                content = content.Replace($"{{{variable.Key}}}", variable.Value);
            }

            injectedMessages.Add(new MessagePayloadDto(message.Role, content));
        }

        // 4. Send to LLM (using the overrides if provided)
        try
        {
            var provider = request.OverrideProvider ?? payloadResult.Value.Provider;
            var model = !string.IsNullOrWhiteSpace(request.OverrideModel)
                ? request.OverrideModel
                : payloadResult.Value.Model;

            // response is now an ExecutionTelemetry object!
            var response = await _executionService.ExecuteAsync(
                injectedMessages,
                provider,
                model,
                cancellationToken);

            return Result<ExecutionTelemetry>.Success(response);
        }
        catch (Exception ex)
        {
            return Result<ExecutionTelemetry>.Failure(new Error("Execution.Failed", ex.Message));
        }
    }
}
