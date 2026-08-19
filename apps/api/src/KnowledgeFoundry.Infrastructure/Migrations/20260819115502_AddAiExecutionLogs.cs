using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace KnowledgeFoundry.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddAiExecutionLogs : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Model",
                table: "Lessons");

            migrationBuilder.DropColumn(
                name: "Provider",
                table: "Lessons");

            migrationBuilder.AddColumn<Guid>(
                name: "AiExecutionLogId",
                table: "Lessons",
                type: "uuid",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "AiExecutionLogs",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Provider = table.Column<int>(type: "integer", nullable: false),
                    TargetModel = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    TokensUsed = table.Column<int>(type: "integer", nullable: false),
                    ExecutionTimeMs = table.Column<long>(type: "bigint", nullable: false),
                    Initiator = table.Column<int>(type: "integer", nullable: false),
                    PromptTemplateId = table.Column<Guid>(type: "uuid", nullable: true),
                    ExecutedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AiExecutionLogs", x => x.Id);
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "AiExecutionLogs");

            migrationBuilder.DropColumn(
                name: "AiExecutionLogId",
                table: "Lessons");

            migrationBuilder.AddColumn<string>(
                name: "Model",
                table: "Lessons",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<int>(
                name: "Provider",
                table: "Lessons",
                type: "integer",
                nullable: false,
                defaultValue: 0);
        }
    }
}
