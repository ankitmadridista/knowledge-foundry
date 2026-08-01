using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace KnowledgeFoundry.Infrastructure.Persistence.Configurations;

internal sealed class PromptTemplateConfiguration
    : IEntityTypeConfiguration<PromptTemplate>
{
    public void Configure(EntityTypeBuilder<PromptTemplate> builder)
    {
        builder.ToTable("PromptTemplates");

        builder.HasKey(x => x.Id);

        builder.OwnsOne(x => x.Identifier, identifier =>
        {
            identifier.Property(x => x.Value)
                .HasColumnName("Identifier")
                .HasMaxLength(50)
                .IsRequired();

            identifier.HasIndex(x => x.Value)
            .IsUnique();
        });

        builder.OwnsOne(x => x.Name, name =>
        {
            name.Property(x => x.Value)
                .HasColumnName("Name")
                .HasMaxLength(200)
                .IsRequired();
        });

        builder.OwnsOne(x => x.Description, description =>
        {
            description.Property(x => x.Value)
                .HasColumnName("Description")
                .HasMaxLength(2000);
        });

        builder.Property(x => x.Purpose)
            .HasConversion<int>()
            .IsRequired();

        builder.Ignore(x => x.Versions);

        builder.Ignore(x => x.Tags);
    }
}
