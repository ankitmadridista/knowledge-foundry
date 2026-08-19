using KnowledgeFoundry.Application.Common.Models;
using KnowledgeFoundry.Application.Common.Results;
using MediatR;

namespace KnowledgeFoundry.Application.AiPlatform.Queries.GetAvailableModels;

public record GetAvailableModelsQuery() : IRequest<Result<List<AiModelDto>>>;
