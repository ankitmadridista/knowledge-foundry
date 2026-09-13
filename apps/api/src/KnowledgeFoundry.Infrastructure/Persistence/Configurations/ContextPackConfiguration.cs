using KnowledgeFoundry.Domain.Common.ValueObjects;
using KnowledgeFoundry.Domain.ContextPacks;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Pgvector;

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

        builder.Property(x => x.OwnerId)
            .HasConversion(
                id => id != null ? id.Value : null,
                value => string.IsNullOrWhiteSpace(value) ? null : new UserId(value))
            .HasColumnName("OwnerId")
            .HasMaxLength(64)
            .IsRequired(false);

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

            // Nested Entities: Chunks (Vector Data)
            version.OwnsMany(x => x.Chunks, chunk =>
            {
                chunk.ToTable("ContextChunks");

                chunk.WithOwner()
                    .HasForeignKey("ContextPackVersionId");

                chunk.HasKey(x => x.Id);
                chunk.Property(x => x.Id).ValueGeneratedNever();

                chunk.Property(x => x.SectionTitle)
                    .HasMaxLength(200)
                    .IsRequired();

                chunk.Property(x => x.Content)
                    .IsRequired();

                chunk.Property(x => x.Embedding)
                    .HasConversion(
                        v => new Vector(v),       // Domain float[] -> DB Vector
                        v => v.ToArray())         // DB Vector -> Domain float[]
                    .HasColumnType("vector(768)")
                    .IsRequired();

                chunk.Property(x => x.TokenCount)
                    .IsRequired();

                chunk.Property(x => x.OrderIndex)
                    .IsRequired();

                chunk.HasIndex(x => x.Embedding)
                    .HasMethod("hnsw")
                    .HasOperators("vector_cosine_ops");
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
