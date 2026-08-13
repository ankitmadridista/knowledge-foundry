using KnowledgeFoundry.Application.Abstractions.Services;
using KnowledgeFoundry.Application.Common.Results;
using KnowledgeFoundry.Application.PromptTemplates.Queries.GetActivePromptPayload;
using MediatR;

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
        // 1. Fetch the active payload using the query we built in the last step!
        var payloadResult = await _mediator.Send(
            new GetActivePromptPayloadQuery(request.Identifier),
            cancellationToken);

        if (payloadResult.IsFailure) return Result<string>.Failure(payloadResult.Error);

        var messages = payloadResult.Value.Messages.ToList();

        // 2. Inject the variables into the message content
        var injectedMessages = new List<MessagePayloadDto>();
        foreach (var message in messages)
        {
            var content = message.Content;

            // Replace {Key} with Value
            foreach (var variable in request.Variables)
            {
                content = content.Replace($"{{{variable.Key}}}", variable.Value);
            }

            injectedMessages.Add(new MessagePayloadDto(message.Role, content));
        }

        // 3. Send to OpenAI
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
