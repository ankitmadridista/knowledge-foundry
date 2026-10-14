using KnowledgeFoundry.Domain.Assessments;
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

        builder.Property(x => x.Status)
            .HasConversion<int>()
            .IsRequired();

        builder.Property(x => x.AiExecutionLogId);

        builder.Property(x => x.CreatedAt)
            .IsRequired();

        builder.Property(x => x.PublishedAt);

        builder.Property(x => x.ErrorMessage)
            .HasMaxLength(2050);

        // Configure the child Question entities
        builder.OwnsMany(x => x.Questions, question =>
        {
            question.ToTable("Questions");

            question.WithOwner()
                .HasForeignKey("QuizId");

            question.HasKey(x => x.Id);

            question.OwnsOne(x => x.Text, text =>
            {
                text.Property(x => x.Value)
                    .HasColumnName("Text")
                    .IsRequired();
            });

            question.Property(x => x.Type)
                .HasConversion<int>()
                .IsRequired();

            question.Property(x => x.Explanation);

            // Configure the grandchild Option entities
            question.OwnsMany(x => x.Options, option =>
            {
                option.ToTable("Options");

                option.WithOwner()
                    .HasForeignKey("QuestionId");

                option.HasKey(x => x.Id);

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
    }
}
