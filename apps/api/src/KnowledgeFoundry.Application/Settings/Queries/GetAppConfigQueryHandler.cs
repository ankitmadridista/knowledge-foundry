using KnowledgeFoundry.Application.Abstractions.Persistence;
using KnowledgeFoundry.Application.Common.Models;
using KnowledgeFoundry.Application.Common.Results;
using MediatR;

namespace KnowledgeFoundry.Application.Settings.Queries.GetConfig;

internal sealed class GetAppConfigQueryHandler
    : IRequestHandler<GetAppConfigQuery, Result<AppConfigDto>>
{
    private readonly ICorpSettingsRepository _repository;

    public GetAppConfigQueryHandler(ICorpSettingsRepository repository)
    {
        _repository = repository;
    }

    public async Task<Result<AppConfigDto>> Handle(
        GetAppConfigQuery request,
        CancellationToken cancellationToken)
    {
        var settings = await _repository.GetSettingsAsync(cancellationToken);

        var dto = new AppConfigDto(
            settings.MaxPromptTemplates,
            settings.MaxContextPacks,
            settings.MaxLessons
        );

        return Result<AppConfigDto>.Success(dto);
    }
}
