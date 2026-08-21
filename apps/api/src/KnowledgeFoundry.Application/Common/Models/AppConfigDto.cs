namespace KnowledgeFoundry.Application.Common.Models;
public sealed record AppConfigDto(
int MaxPromptTemplates,
int MaxContextPacks,
int MaxLessons);
