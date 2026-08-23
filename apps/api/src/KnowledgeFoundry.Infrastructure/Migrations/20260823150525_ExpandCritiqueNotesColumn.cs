using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace KnowledgeFoundry.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class ExpandCritiqueNotesColumn : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<string>(
                name: "CritiqueNotes",
                table: "Lessons",
                type: "text",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "character varying(4000)",
                oldMaxLength: 4000,
                oldNullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<string>(
                name: "CritiqueNotes",
                table: "Lessons",
                type: "character varying(4000)",
                maxLength: 4000,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "text",
                oldNullable: true);
        }
    }
}
