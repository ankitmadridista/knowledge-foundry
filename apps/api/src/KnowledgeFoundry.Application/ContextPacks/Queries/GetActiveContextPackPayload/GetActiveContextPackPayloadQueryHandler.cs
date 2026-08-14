using KnowledgeFoundry.Application.Abstractions.Persistence;
using KnowledgeFoundry.Application.Common.Errors;
using KnowledgeFoundry.Application.Common.Results;
using KnowledgeFoundry.Domain.ContextPacks.Enums;
using MediatR;
using System.Text;

namespace KnowledgeFoundry.Application.ContextPacks.Queries.GetActiveContextPackPayload;

public sealed class GetActiveContextPackPayloadQueryHandler
    : IRequestHandler<GetActiveContextPackPayloadQuery, Result<string>>
{
    private readonly IContextPackRepository _repository;

    public GetActiveContextPackPayloadQueryHandler(IContextPackRepository repository)
    {
        _repository = repository;
    }

    public async Task<Result<string>> Handle(
        GetActiveContextPackPayloadQuery request,
        CancellationToken cancellationToken)
    {
        var contextPack = await _repository.GetByIdentifierAsync(request.Identifier, cancellationToken);

        if (contextPack is null)
            return Result<string>.Failure(ContextPackErrors.NotFound);

        var activeVersion = contextPack.Versions
            .SingleOrDefault(v => v.Status == ContextPackStatus.Active);

        if (activeVersion is null)
            return Result<string>.Failure(new Error(
                "ContextPack.NoActiveVersion",
                $"The context pack '{request.Identifier}' does not have an Active version."));

        // Format the sections into a clean Markdown document for the AI to read
        var sb = new StringBuilder();
        sb.AppendLine($"# Context: {contextPack.Name.Value}");
        sb.AppendLine();

        // Order the sections sequentially
        foreach (var section in activeVersion.Sections.OrderBy(s => s.Order))
        {
            sb.AppendLine($"## {section.Title}");
            sb.AppendLine(section.Content);
            sb.AppendLine();
        }

        return Result<string>.Success(sb.ToString().TrimEnd());
    }
}
