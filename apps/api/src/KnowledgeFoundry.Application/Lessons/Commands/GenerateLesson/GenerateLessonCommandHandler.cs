using KnowledgeFoundry.Application.Abstractions.Persistence;
using KnowledgeFoundry.Application.Abstractions.Services;
using KnowledgeFoundry.Application.Common.Errors;
using KnowledgeFoundry.Application.Common.Results;
using KnowledgeFoundry.Domain.PromptTemplates.Enums;
using KnowledgeFoundry.Domain.ContextPacks.Enums;
using MediatR;
using System.Text;
using KnowledgeFoundry.Application.PromptTemplates.Queries.GetActivePromptPayload;
using KnowledgeFoundry.Domain.Lessons;

namespace KnowledgeFoundry.Application.Lessons.Commands.GenerateLesson;

public sealed class GenerateLessonCommandHandler
    : IRequestHandler<GenerateLessonCommand, Result<Guid>>
{
    private readonly ILessonRepository _lessonRepository;
    private readonly IPromptTemplateRepository _templateRepository;
    private readonly IContextPackRepository _contextPackRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly IPromptExecutionService _executionService;

    public GenerateLessonCommandHandler(
        ILessonRepository lessonRepository,
        IPromptTemplateRepository templateRepository,
        IContextPackRepository contextPackRepository,
        IUnitOfWork unitOfWork,
        IPromptExecutionService executionService)
    {
        _lessonRepository = lessonRepository;
        _templateRepository = templateRepository;
        _contextPackRepository = contextPackRepository;
        _unitOfWork = unitOfWork;
        _executionService = executionService;
    }

    public async Task<Result<Guid>> Handle(
        GenerateLessonCommand request,
        CancellationToken cancellationToken)
    {
        // 1. Validate the Prompt Template exists and has an Active version
        var template = await _templateRepository.GetByIdAsync(request.PromptTemplateId, cancellationToken);

        if (template is null)
            return Result<Guid>.Failure(LessonErrors.TemplateNotFound);

        var activeVersion = template.Versions.SingleOrDefault(v => v.Status == PromptStatus.Active);

        if (activeVersion is null)
            return Result<Guid>.Failure(LessonErrors.NoActiveTemplate);

        // 2. Fetch the Context Pack content if one was provided
        string contextContent = string.Empty;
        if (request.ContextPackId.HasValue)
        {
            var pack = await _contextPackRepository.GetByIdAsync(request.ContextPackId.Value, cancellationToken);

            if (pack is null)
                return Result<Guid>.Failure(LessonErrors.ContextPackNotFound);

            var activePackVersion = pack.Versions.SingleOrDefault(v => v.Status == ContextPackStatus.Active);
            if (activePackVersion is not null)
            {
                var sb = new StringBuilder();
                foreach (var section in activePackVersion.Sections.OrderBy(s => s.Order))
                {
                    sb.AppendLine($"# {section.Title}");
                    sb.AppendLine(section.Content);
                    sb.AppendLine();
                }
                contextContent = sb.ToString();
            }
        }

        // 3. Create the Lesson entity in its initial 'Generating' state and save to DB
        var lesson = Lesson.CreatePending(
            request.Title,
            request.Topic,
            request.Audience,
            request.PromptTemplateId,
            request.ContextPackId);

        await _lessonRepository.AddAsync(lesson, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        // 4. Prepare the AI payload (Replace variables in the prompt messages)
        var injectedMessages = new List<MessagePayloadDto>();
        foreach (var message in activeVersion.Messages.OrderBy(m => m.Order))
        {
            var content = message.Content;

            // Replace standard Lesson variables
            content = content.Replace("{Topic}", request.Topic, StringComparison.OrdinalIgnoreCase);
            content = content.Replace("{Audience}", request.Audience, StringComparison.OrdinalIgnoreCase);

            // If the prompt template uses a generic {Context} tag for the lesson generator
            content = content.Replace("{Context}", contextContent, StringComparison.OrdinalIgnoreCase);

            injectedMessages.Add(new MessagePayloadDto(message.Role.ToString(), content));
        }

        // 5. Execute the AI Call & Update the Lesson Entity
        try
        {
            var generatedMarkdown = await _executionService.ExecuteAsync(injectedMessages, cancellationToken);
            lesson.MarkAsCompleted(generatedMarkdown);
        }
        catch (Exception ex)
        {
            lesson.MarkAsFailed(ex.Message);
        }

        // 6. Save the final Completed/Failed state to the database
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result<Guid>.Success(lesson.Id);
    }
}
