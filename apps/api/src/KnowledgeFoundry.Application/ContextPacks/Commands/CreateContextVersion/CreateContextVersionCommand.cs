using KnowledgeFoundry.Application.Common.Results;
using KnowledgeFoundry.Application.ContextPacks.Models;
using MediatR;

namespace KnowledgeFoundry.Application.ContextPacks.Commands.CreateContextVersion;

// Returns the newly created Version Number (e.g., Result<int>)
public sealed record CreateContextVersionCommand(
    Guid ContextPackId,
    IEnumerable<ContextSectionDto> Sections) : IRequest<Result<int>>;
