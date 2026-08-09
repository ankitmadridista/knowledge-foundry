using MediatR;
using KnowledgeFoundry.Application.Common.Results;

namespace KnowledgeFoundry.Application.PromptTemplates.Commands.CreatePromptTemplate;

public sealed class CreatePromptTemplateCommandHandler
    : IRequestHandler<CreatePromptTemplateCommand, Result<Guid>>
{
    public async Task<Result<Guid>> Handle(
        CreatePromptTemplateCommand request,
        CancellationToken cancellationToken)
    {
        // TODO: Replace with real repository + domain creation
        // in Sprint 5.

        await Task.CompletedTask;

        return Result<Guid>.Success(Guid.NewGuid());
    }
}
