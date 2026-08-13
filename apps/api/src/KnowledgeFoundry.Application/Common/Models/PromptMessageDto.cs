using KnowledgeFoundry.Domain.PromptTemplates.Enums;

namespace KnowledgeFoundry.Application.Common.Models;

public record PromptMessageDto(
    PromptMessageRole Role,
    string Content,
    int Order);
