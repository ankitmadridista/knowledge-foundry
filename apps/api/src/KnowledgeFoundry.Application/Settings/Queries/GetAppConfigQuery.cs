using KnowledgeFoundry.Application.Common.Models;
using KnowledgeFoundry.Application.Common.Results;
using MediatR;

namespace KnowledgeFoundry.Application.Settings.Queries.GetConfig;

public sealed record GetAppConfigQuery() : IRequest<Result<AppConfigDto>>;
