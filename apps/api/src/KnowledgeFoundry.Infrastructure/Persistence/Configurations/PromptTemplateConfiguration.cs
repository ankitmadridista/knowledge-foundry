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

        builder.OwnsMany(x => x.Versions, version =>
        {
            version.ToTable("PromptTemplateVersions");

            version.WithOwner()
                   .HasForeignKey("PromptTemplateId");

            version.HasKey(x => x.Id);

            version.OwnsOne(x => x.VersionNumber, number =>
            {
                number.Property(x => x.Value)
                    .HasColumnName("VersionNumber");
            });

            version.Property(x => x.Capability)
                .HasConversion<int>();

            version.Property(x => x.Status)
                .HasConversion<int>();

            version.Property(x => x.CreatedAt);

            version.Property(x => x.PublishedAt);

            version.Property(x => x.ActivatedAt);

            version.Property(x => x.ArchivedAt);

            version.Property(x => x.DeprecatedAt);

            version.Ignore(x => x.Messages);

        });

        builder.Ignore(x => x.Tags);
    }
}
