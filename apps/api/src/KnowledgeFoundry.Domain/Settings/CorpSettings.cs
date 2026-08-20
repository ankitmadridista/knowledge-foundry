using KnowledgeFoundry.Domain.Common.Exceptions;

namespace KnowledgeFoundry.Domain.Settings;

public sealed class CorpSettings : Entity
{
    // Private parameterless constructor for EF Core
    private CorpSettings()
    {
    }

    public int MaxPromptTemplates { get; private set; }
    public int MaxContextPacks { get; private set; }
    public int MaxLessons { get; private set; }

    public static readonly Guid GlobalSettingsId = Guid.Parse("11111111-1111-1111-1111-111111111111");

    private CorpSettings(
        int maxPromptTemplates,
        int maxContextPacks,
        int maxLessons)
    {
        // Guard clauses to protect domain invariants
        if (maxPromptTemplates < 0)
            throw new ArgumentOutOfRangeException(nameof(maxPromptTemplates), "Quota cannot be negative.");

        if (maxContextPacks < 0)
            throw new ArgumentOutOfRangeException(nameof(maxContextPacks), "Quota cannot be negative.");

        if (maxLessons < 0)
            throw new ArgumentOutOfRangeException(nameof(maxLessons), "Quota cannot be negative.");

        MaxPromptTemplates = maxPromptTemplates;
        MaxContextPacks = maxContextPacks;
        MaxLessons = maxLessons;
    }

    public static CorpSettings Create(
        int maxPromptTemplates = 25,
        int maxContextPacks = 50,
        int maxLessons = 50)
    {
        return new CorpSettings(maxPromptTemplates, maxContextPacks, maxLessons);
    }

    public void UpdateLimits(int newPromptLimit, int newContextLimit, int newLessonLimit)
    {
        if (newPromptLimit < 0 || newContextLimit < 0 || newLessonLimit < 0)
            throw new DomainException("Quotas cannot be negative.");

        MaxPromptTemplates = newPromptLimit;
        MaxContextPacks = newContextLimit;
        MaxLessons = newLessonLimit;
    }
}
