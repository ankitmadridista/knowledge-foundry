using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace KnowledgeFoundry.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddLessonEvaluations : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "LessonEvaluations",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    LessonId = table.Column<Guid>(type: "uuid", nullable: false),
                    EvaluatorPromptTemplateId = table.Column<Guid>(type: "uuid", nullable: false),
                    ScorecardJson = table.Column<string>(type: "jsonb", nullable: false),
                    Provider = table.Column<int>(type: "integer", nullable: false),
                    Model = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    AiExecutionLogId = table.Column<Guid>(type: "uuid", nullable: false),
                    EvaluatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_LessonEvaluations", x => x.Id);
                    table.ForeignKey(
                        name: "FK_LessonEvaluations_Lessons_LessonId",
                        column: x => x.LessonId,
                        principalTable: "Lessons",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_LessonEvaluations_LessonId",
                table: "LessonEvaluations",
                column: "LessonId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "LessonEvaluations");
        }
    }
}
