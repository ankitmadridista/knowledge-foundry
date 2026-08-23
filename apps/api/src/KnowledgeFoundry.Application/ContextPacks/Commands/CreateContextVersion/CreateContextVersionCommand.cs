using KnowledgeFoundry.Application.Common.Results;
using KnowledgeFoundry.Application.DomainModels;
using MediatR;

namespace KnowledgeFoundry.Application.ContextPacks.Commands.CreateContextVersion;

public sealed record CreateContextVersionCommand(
    Guid ContextPackId,
    IEnumerable<ContextSectionDto> Sections) : IRequest<Result<int>>;
