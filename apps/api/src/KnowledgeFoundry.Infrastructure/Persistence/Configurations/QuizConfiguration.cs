using KnowledgeFoundry.Domain.Assessments;
using KnowledgeFoundry.Domain.Common.ValueObjects;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace KnowledgeFoundry.Infrastructure.Persistence.Configurations;

internal sealed class QuizConfiguration : IEntityTypeConfiguration<Quiz>
{
    public void Configure(EntityTypeBuilder<Quiz> builder)
    {
        builder.ToTable("Quizzes");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.LessonId)
            .IsRequired();

        builder.OwnsOne(x => x.Title, title =>
        {
            title.Property(x => x.Value)
                .HasColumnName("Title")
                .HasMaxLength(200)
                .IsRequired();
        });

        builder.Property(x => x.OwnerId)
            .HasConversion(
                id => id != null ? id.Value : null,
                value => string.IsNullOrWhiteSpace(value) ? null! : new UserId(value))
            .HasColumnName("OwnerId")
            .HasMaxLength(64)
            .IsRequired();

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

        builder.Property(x => x.AiExecutionLogId)
            .IsRequired(false);

        builder.Property(x => x.CreatedAt)
            .IsRequired();

        builder.Property(x => x.PublishedAt)
            .IsRequired(false);

        builder.OwnsMany(x => x.Questions, question =>
        {
            question.ToTable("Questions");

            question.WithOwner()
                .HasForeignKey("QuizId");

            question.HasKey(x => x.Id);

            question.Property(x => x.Id).ValueGeneratedNever();

            question.OwnsOne(x => x.Text, text =>
            {
                text.Property(x => x.Value)
                    .HasColumnName("Text")
                    .IsRequired();
            });

            question.Property(x => x.Type)
                .HasConversion<int>()
                .IsRequired();

            question.Property(x => x.Explanation)
                .IsRequired(false);

            question.OwnsMany(x => x.Options, option =>
            {
                option.ToTable("Options");

                option.WithOwner()
                    .HasForeignKey("QuestionId");

                option.HasKey(x => x.Id);

                option.Property(x => x.Id).ValueGeneratedNever();

                option.OwnsOne(x => x.Text, text =>
                {
                    text.Property(x => x.Value)
                        .HasColumnName("Text")
                        .IsRequired();
                });

                option.Property(x => x.IsCorrect)
                    .IsRequired();
            });
        });

        builder.Metadata.FindNavigation(nameof(Quiz.Questions))!
            .SetPropertyAccessMode(PropertyAccessMode.Field);
    }
}
