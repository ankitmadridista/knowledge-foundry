using KnowledgeFoundry.Domain.Lessons;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace KnowledgeFoundry.Infrastructure.Persistence.Configurations;

internal sealed class LessonConfiguration : IEntityTypeConfiguration<Lesson>
{
    public void Configure(EntityTypeBuilder<Lesson> builder)
    {
        builder.ToTable("Lessons");

        builder.HasKey(x => x.Id);

        builder.OwnsOne(x => x.Title, title =>
        {
            title.Property(x => x.Value)
                .HasColumnName("Title")
                .HasMaxLength(200)
                .IsRequired();
        });

        builder.OwnsOne(x => x.Topic, topic =>
        {
            topic.Property(x => x.Value)
                .HasColumnName("Topic")
                .HasMaxLength(500)
                .IsRequired();
        });

        builder.OwnsOne(x => x.Audience, audience =>
        {
            audience.Property(x => x.Value)
                .HasColumnName("Audience")
                .HasMaxLength(100)
                .IsRequired();
        });

        builder.OwnsOne(x => x.Content, content =>
        {
            content.Property(x => x.Value)
                .HasColumnName("Content")
                .IsRequired(false); // Nullable because it starts as Generating
        });

        builder.Property(x => x.Status)
            .HasConversion<int>()
            .IsRequired();

        builder.Property(x => x.IsManuallyEdited)
            .IsRequired()
            .HasDefaultValue(false);

        builder.Property(x => x.ErrorMessage)
            .HasMaxLength(2000)
            .IsRequired(false);

        builder.Property(x => x.PromptTemplateId)
            .IsRequired();

        builder.Property(x => x.ContextPackId)
            .IsRequired(false);

        builder.Property(x => x.CreatedAt)
            .IsRequired();

        builder.Property(x => x.CompletedAt)
            .IsRequired(false);

        builder.Property(x => x.CriticPromptTemplateId)
            .IsRequired(false);

        builder.OwnsOne(x => x.CritiqueNotes, notes =>
        {
            notes.Property(x => x.Value)
                .HasColumnName("CritiqueNotes")
                .HasMaxLength(4000)
                .IsRequired(false);
        });
    }
}
