using KnowledgeFoundry.Application.Common.Results;
using MediatR;

namespace KnowledgeFoundry.Application.ContextPacks.Commands.CreateContextPack;

public sealed record CreateContextPackCommand(
    string Identifier,
    string Name,
    string Description,
    IEnumerable<string>? Tags) : IRequest<Result<Guid>>;
