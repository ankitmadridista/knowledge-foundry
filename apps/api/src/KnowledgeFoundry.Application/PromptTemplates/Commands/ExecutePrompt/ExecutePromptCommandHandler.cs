using KnowledgeFoundry.Application.Abstractions.Services;
using KnowledgeFoundry.Application.Common.Results;
using KnowledgeFoundry.Application.ContextPacks.Queries.GetActiveContextPackPayload;
using KnowledgeFoundry.Application.PromptTemplates.Queries.GetActivePromptPayload;
using MediatR;
using System.Text.RegularExpressions;

namespace KnowledgeFoundry.Application.PromptExecutions.Commands.ExecutePrompt;

public sealed class ExecutePromptCommandHandler
    : IRequestHandler<ExecutePromptCommand, Result<string>>
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

    public async Task<Result<string>> Handle(
        ExecutePromptCommand request,
        CancellationToken cancellationToken)
    {
        // 1. Fetch the active prompt payload
        var payloadResult = await _mediator.Send(
            new GetActivePromptPayloadQuery(request.Identifier),
            cancellationToken);

        if (payloadResult.IsFailure) return Result<string>.Failure(payloadResult.Error);

        var messages = payloadResult.Value.Messages.ToList();
        var injectedMessages = new List<MessagePayloadDto>();

        // Regex to find tags like {Context:BRAND-VOICE}
        var contextRegex = new Regex(@"\{Context:([a-zA-Z0-9_-]+)\}", RegexOptions.IgnoreCase);

        // 2. Process each message
        foreach (var message in messages)
        {
            var content = message.Content;

            // --- NEW: CONTEXT PACK INJECTION ---
            var contextMatches = contextRegex.Matches(content);
            foreach (Match match in contextMatches)
            {
                var contextIdentifier = match.Groups[1].Value;

                // Fetch the active context pack using a new MediatR query
                var contextResult = await _mediator.Send(
                    new GetActiveContextPackPayloadQuery(contextIdentifier),
                    cancellationToken);

                if (contextResult.IsFailure)
                {
                    // If the context pack fails to load, we fail the whole execution
                    // to prevent the AI from hallucinating without its knowledge base.
                    return Result<string>.Failure(contextResult.Error);
                }

                // Replace the tag {Context:XXX} with the actual markdown content
                content = content.Replace(match.Value, contextResult.Value);
            }
            // -----------------------------------

            // 3. Inject standard user variables
            foreach (var variable in request.Variables)
            {
                content = content.Replace($"{{{variable.Key}}}", variable.Value);
            }

            injectedMessages.Add(new MessagePayloadDto(message.Role, content));
        }

        // 4. Send to LLM (Groq/OpenAI)
        try
        {
            var result = await _executionService.ExecuteAsync(injectedMessages, cancellationToken);
            return Result<string>.Success(result);
        }
        catch (Exception ex)
        {
            return Result<string>.Failure(new Error("Execution.Failed", ex.Message));
        }
    }
}
