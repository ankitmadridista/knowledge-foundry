using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace KnowledgeFoundry.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddSemanticRagCorpSetting : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "IsSemanticRagEnabled",
                table: "CorpSettings",
                type: "boolean",
                nullable: false,
                defaultValue: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IsSemanticRagEnabled",
                table: "CorpSettings");
        }
    }
}
