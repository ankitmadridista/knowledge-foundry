using KnowledgeFoundry.Application.Abstractions.Persistence;
using KnowledgeFoundry.Application.Common.Errors;
using KnowledgeFoundry.Application.Common.Results;
using KnowledgeFoundry.Application.ContextPacks.Commands.ActivateContextVersion;
using KnowledgeFoundry.Application.PromptTemplates.Commands.PublishPromptVersion;
using KnowledgeFoundry.Domain.ContextPacks.ValueObjects;
using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace KnowledgeFoundry.Application.ContextPacks.Commands.PublishContextVersion
{
    internal class PublishContextVersionCommandHandler
        : IRequestHandler<PublishContextVersionCommand, Result<bool>>
    {
        private readonly IContextPackRepository _repository;
        private readonly IUnitOfWork _unitOfWork;

        public PublishContextVersionCommandHandler(
            IContextPackRepository repository,
            IUnitOfWork unitOfWork)
        {
            _repository = repository;
            _unitOfWork = unitOfWork;
        }

        public async Task<Result<bool>> Handle(
            PublishContextVersionCommand request,
            CancellationToken cancellationToken)
        {
            var contextPack = await _repository.GetByIdAsync(request.ContextPackId, cancellationToken);

            if (contextPack is null)
            {
                return Result<bool>.Failure(ContextPackErrors.NotFound);
            }

            contextPack.PublishVersion(new ContextVersionNumber(request.VersionNumber));

            await _unitOfWork.SaveChangesAsync(cancellationToken);

            return Result<bool>.Success(true);
        }
    }
}
