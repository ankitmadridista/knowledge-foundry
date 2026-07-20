using MediatR;

namespace KnowledgeFoundry.Application.PromptTemplates.Commands.CreatePromptTemplate;

public sealed class CreatePromptTemplateCommandHandler
    : IRequestHandler<CreatePromptTemplateCommand, Guid>
{
    public async Task<Guid> Handle(
        CreatePromptTemplateCommand request,
        CancellationToken cancellationToken)
    {
        // TODO: Replace with real repository + domain creation
        // in Sprint 5.

        await Task.CompletedTask;

        return Guid.NewGuid();
    }
}