using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace KnowledgeFoundry.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddContextPacks : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "ContextPacks",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Identifier = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    Name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    Description = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ContextPacks", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "ContextPackVersions",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    VersionNumber = table.Column<int>(type: "integer", nullable: false),
                    Status = table.Column<int>(type: "integer", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    PublishedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    ActivatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    ArchivedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    DeprecatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    ContextPackId = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ContextPackVersions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ContextPackVersions_ContextPacks_ContextPackId",
                        column: x => x.ContextPackId,
                        principalTable: "ContextPacks",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ContextTags",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Value = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    ContextPackId = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ContextTags", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ContextTags_ContextPacks_ContextPackId",
                        column: x => x.ContextPackId,
                        principalTable: "ContextPacks",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ContextSections",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Title = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    Content = table.Column<string>(type: "text", nullable: false),
                    Order = table.Column<int>(type: "integer", nullable: false),
                    ContextPackVersionId = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ContextSections", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ContextSections_ContextPackVersions_ContextPackVersionId",
                        column: x => x.ContextPackVersionId,
                        principalTable: "ContextPackVersions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_ContextPacks_Identifier",
                table: "ContextPacks",
                column: "Identifier",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ContextPackVersions_ContextPackId",
                table: "ContextPackVersions",
                column: "ContextPackId");

            migrationBuilder.CreateIndex(
                name: "IX_ContextSections_ContextPackVersionId",
                table: "ContextSections",
                column: "ContextPackVersionId");

            migrationBuilder.CreateIndex(
                name: "IX_ContextTags_ContextPackId_Value",
                table: "ContextTags",
                columns: new[] { "ContextPackId", "Value" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ContextSections");

            migrationBuilder.DropTable(
                name: "ContextTags");

            migrationBuilder.DropTable(
                name: "ContextPackVersions");

            migrationBuilder.DropTable(
                name: "ContextPacks");
        }
    }
}
