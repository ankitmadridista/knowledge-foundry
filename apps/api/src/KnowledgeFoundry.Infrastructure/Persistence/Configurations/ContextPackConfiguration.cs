using KnowledgeFoundry.Domain.ContextPacks;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace KnowledgeFoundry.Infrastructure.Persistence.Configurations;

internal sealed class ContextPackConfiguration
    : IEntityTypeConfiguration<ContextPack>
{
    public void Configure(EntityTypeBuilder<ContextPack> builder)
    {
        builder.ToTable("ContextPacks");

        builder.HasKey(x => x.Id);

        // Value Object: Identifier
        builder.OwnsOne(x => x.Identifier, identifier =>
        {
            identifier.Property(x => x.Value)
                .HasColumnName("Identifier")
                .HasMaxLength(50)
                .IsRequired();

            identifier.HasIndex(x => x.Value)
                .IsUnique();
        });

        // Value Object: Name
        builder.OwnsOne(x => x.Name, name =>
        {
            name.Property(x => x.Value)
                .HasColumnName("Name")
                .HasMaxLength(200)
                .IsRequired();
        });

        // Value Object: Description
        builder.OwnsOne(x => x.Description, description =>
        {
            description.Property(x => x.Value)
                .HasColumnName("Description")
                .HasMaxLength(2000);
        });

        // Child Entities: Versions
        builder.OwnsMany(x => x.Versions, version =>
        {
            version.ToTable("ContextPackVersions");

            version.WithOwner()
                   .HasForeignKey("ContextPackId");

            version.HasKey(x => x.Id);
            version.Property(x => x.Id).ValueGeneratedNever();

            version.OwnsOne(x => x.VersionNumber, number =>
            {
                number.Property(x => x.Value)
                    .HasColumnName("VersionNumber")
                    .IsRequired();
            });

            version.Property(x => x.Status)
                .HasConversion<int>()
                .IsRequired();

            version.Property(x => x.CreatedAt);
            version.Property(x => x.PublishedAt);
            version.Property(x => x.ActivatedAt);
            version.Property(x => x.ArchivedAt);
            version.Property(x => x.DeprecatedAt);

            // Nested Value Objects: Sections
            version.OwnsMany(x => x.Sections, section =>
            {
                section.ToTable("ContextSections");

                section.WithOwner()
                    .HasForeignKey("ContextPackVersionId");

                // Shadow property for primary key
                section.Property<Guid>("Id");
                section.HasKey("Id");

                section.Property(x => x.Title)
                    .HasMaxLength(200)
                    .IsRequired();

                section.Property(x => x.Content)
                    .IsRequired(); // No max length specified, allows for large text/markdown

                section.Property(x => x.Order)
                    .IsRequired();
            });
        });

        // Child Value Objects: Tags
        builder.OwnsMany(x => x.Tags, tag =>
        {
            tag.ToTable("ContextTags");

            tag.WithOwner()
                .HasForeignKey("ContextPackId");

            tag.Property<Guid>("Id");
            tag.HasKey("Id");

            tag.Property(x => x.Value)
                .HasColumnName("Value")
                .HasMaxLength(50)
                .IsRequired();

            tag.HasIndex(
                "ContextPackId",
                "Value")
                .IsUnique();
        });
    }
}
