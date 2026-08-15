using KnowledgeFoundry.Application.Abstractions.Persistence;
using KnowledgeFoundry.Application.Common.Errors;
using KnowledgeFoundry.Application.Common.Results;
using KnowledgeFoundry.Domain.ContextPacks.ValueObjects;
using MediatR;

namespace KnowledgeFoundry.Application.ContextPacks.Commands.ActivateContextVersion
{
    internal class ActivateContextVersionCommandHandler : IRequestHandler<ActivateContextVersionCommand, Result<bool>>
    {

        private readonly IContextPackRepository _repository;
        private readonly IUnitOfWork _unitOfWork;

        public ActivateContextVersionCommandHandler(
            IContextPackRepository repository,
            IUnitOfWork unitOfWork)
        {
            _repository = repository;
            _unitOfWork = unitOfWork;
        }

        public async Task<Result<bool>> Handle(
            ActivateContextVersionCommand request,
            CancellationToken cancellationToken)
        {
            var contextPack = await _repository.GetByIdAsync(request.ContextPackId, cancellationToken);

            if(contextPack is null)
            {
                return Result<bool>.Failure(ContextPackErrors.NotFound);
            }

            contextPack.ActivateVersion(new ContextVersionNumber(request.VersionNumber));

            await _unitOfWork.SaveChangesAsync(cancellationToken);

            return Result<bool>.Success(true);
        }

    }
}
