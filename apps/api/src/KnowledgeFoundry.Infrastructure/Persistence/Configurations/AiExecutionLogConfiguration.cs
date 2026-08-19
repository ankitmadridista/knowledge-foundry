using KnowledgeFoundry.Domain.AiPlatform;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace KnowledgeFoundry.Infrastructure.Persistence.Configurations;

internal sealed class AiExecutionLogConfiguration : IEntityTypeConfiguration<AiExecutionLog>
{
    public void Configure(EntityTypeBuilder<AiExecutionLog> builder)
    {
        builder.ToTable("AiExecutionLogs");

        builder.HasKey(x => x.Id);

        // Convert the Provider Enum to integer
        builder.Property(x => x.Provider)
            .HasConversion<int>()
            .IsRequired();

        // Flatten the TargetModel Value Object into a single column
        builder.OwnsOne(x => x.Model, model =>
        {
            model.Property(m => m.Value)
                .HasColumnName("TargetModel")
                .HasMaxLength(100)
                .IsRequired();
        });

        builder.Property(x => x.TokensUsed)
            .IsRequired();

        builder.Property(x => x.ExecutionTimeMs)
            .IsRequired();

        // Convert the Initiator Enum to integer
        builder.Property(x => x.Initiator)
            .HasConversion<int>()
            .IsRequired();

        builder.Property(x => x.PromptTemplateId);

        builder.Property(x => x.ExecutedAt)
            .IsRequired();
    }
}
