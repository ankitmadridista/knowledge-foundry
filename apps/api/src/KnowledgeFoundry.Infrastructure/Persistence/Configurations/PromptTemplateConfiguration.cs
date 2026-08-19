using KnowledgeFoundry.Domain.PromptTemplates;
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

        builder.Property(x => x.Provider)
            .HasConversion<int>()
            .IsRequired();

        builder.OwnsOne(x => x.Model, model =>
        {
            model.Property(x => x.Value)
                .HasColumnName("TargetModel")
                .HasMaxLength(100)
                .IsRequired();
        });

        builder.OwnsMany(x => x.Versions, version =>
        {
            version.ToTable("PromptTemplateVersions");

            version.WithOwner()
                   .HasForeignKey("PromptTemplateId");

            version.HasKey(x => x.Id);

            version.Property(x => x.Id).ValueGeneratedNever();

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

            version.OwnsMany(x => x.Messages, message =>
            {
                message.ToTable("PromptMessages");

                message.WithOwner()
                    .HasForeignKey("PromptTemplateVersionId");

                message.Property<Guid>("Id");
                message.HasKey("Id");

                message.Property(x => x.Role);
                message.Property(x => x.Content);
                message.Property(x => x.Order);
            });

            version.OwnsMany(x => x.Variables, variable =>
            {
                variable.ToTable("PromptVariables");

                variable.WithOwner()
                    .HasForeignKey("PromptTemplateVersionId");

                variable.Property<Guid>("Id");
                variable.HasKey("Id");

                variable.Property(x => x.Name)
                    .HasColumnName("Name")
                    .HasMaxLength(100)
                    .IsRequired();
            });
        });

        builder.OwnsMany(x => x.Tags, tag =>
        {
            tag.ToTable("PromptTags");

            tag.WithOwner()
                .HasForeignKey("PromptTemplateId");

            tag.Property<Guid>("Id");
            tag.HasKey("Id");

            tag.Property(x => x.Value)
                .HasColumnName("Value")
                .HasMaxLength(100)
                .IsRequired();

            tag.HasIndex(
                "PromptTemplateId",
                "Value")
                .IsUnique();
        });
    }
}
