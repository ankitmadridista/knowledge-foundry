using KnowledgeFoundry.Domain.Settings;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace KnowledgeFoundry.Infrastructure.Persistence.Configurations;

internal sealed class CorpSettingsConfiguration : IEntityTypeConfiguration<CorpSettings>
{
    public void Configure(EntityTypeBuilder<CorpSettings> builder)
    {
        builder.ToTable("CorpSettings");
        builder.HasKey(x => x.Id);
        builder.Property(x => x.MaxPromptTemplates).IsRequired();
        builder.Property(x => x.MaxContextPacks).IsRequired();
        builder.Property(x => x.MaxLessons).IsRequired();
    }
}
