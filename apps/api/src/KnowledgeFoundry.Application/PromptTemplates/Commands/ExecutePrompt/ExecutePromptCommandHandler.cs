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

    // Compiled Regex for performance (standard practice in high-throughput handlers)
    private static readonly Regex ContextRegex = new(@"\{Context:([a-zA-Z0-9_-]+)\}", RegexOptions.IgnoreCase | RegexOptions.Compiled);

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

       var uniqueContextIdentifiers = messages
            .SelectMany(m => ContextRegex.Matches(m.Content).Select(match => match.Groups[1].Value))
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .ToList();

        var contextDictionary = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase);

        foreach (var identifier in uniqueContextIdentifiers)
        {
            var contextResult = await _mediator.Send(
                new GetActiveContextPackPayloadQuery(identifier),
                cancellationToken);

            if (contextResult.IsFailure)
            {
                return Result<ExecutionTelemetry>.Failure(contextResult.Error);
            }

            contextDictionary[identifier] = contextResult.Value;
        }

        // 3. Process and Inject variables into each message
        var injectedMessages = new List<MessagePayloadDto>(messages.Count);

        foreach (var message in messages)
        {
            var content = message.Content;

            // --- CONTEXT PACK INJECTION ---
            var contextMatches = ContextRegex.Matches(content);
            foreach (Match match in contextMatches)
            {
                var contextIdentifier = match.Groups[1].Value;
                if (contextDictionary.TryGetValue(contextIdentifier, out var packContent))
                {
                    // Replaces {Context:Identifier} with the actual textbook data
                    content = content.Replace(match.Value, packContent, StringComparison.OrdinalIgnoreCase);
                }
            }

            foreach (var variable in request.Variables)
            {
                content = content.Replace($"{{{variable.Key}}}", variable.Value, StringComparison.OrdinalIgnoreCase);
            }

            injectedMessages.Add(new MessagePayloadDto(message.Role, content));
        }

        // 4. Send to LLM Pipeline
        try
        {
            var provider = request.OverrideProvider ?? payloadResult.Value.Provider;
            var model = !string.IsNullOrWhiteSpace(request.OverrideModel)
                ? request.OverrideModel
                : payloadResult.Value.Model;

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
