using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PuzzleTracker.Server.Migrations
{
    /// <inheritdoc />
    public partial class AddApplicationUserAndPuzzles : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "DisplayName",
                table: "AspNetUsers",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "Brands",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Name = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    WebsiteUrl = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    LogoImgSrc = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Brands", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Illustrators",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Name = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Illustrators", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Series",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Name = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    BrandId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Series", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Series_Brands_BrandId",
                        column: x => x.BrandId,
                        principalTable: "Brands",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Puzzles",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    NameEnglish = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    NameLocal = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    LocalLanguage = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ProductNumber = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    NumberOfPieces = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    SortablePieceCount = table.Column<int>(type: "int", nullable: false),
                    BoxImgSrc = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    BrandId = table.Column<int>(type: "int", nullable: false),
                    PuzzleSeriesId = table.Column<int>(type: "int", nullable: true),
                    IllustratorId = table.Column<int>(type: "int", nullable: true),
                    BrandId1 = table.Column<int>(type: "int", nullable: true),
                    PuzzleType = table.Column<string>(type: "nvarchar(13)", maxLength: 13, nullable: false),
                    Publisher = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ReleaseDate = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Manufacturer = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    IsComboPack = table.Column<bool>(type: "bit", nullable: true),
                    CreatedByUserId = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    DateAdded = table.Column<DateTime>(type: "datetime2", nullable: true),
                    IsPublic = table.Column<bool>(type: "bit", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Puzzles", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Puzzles_Brands_BrandId",
                        column: x => x.BrandId,
                        principalTable: "Brands",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Puzzles_Brands_BrandId1",
                        column: x => x.BrandId1,
                        principalTable: "Brands",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_Puzzles_Illustrators_IllustratorId",
                        column: x => x.IllustratorId,
                        principalTable: "Illustrators",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_Puzzles_Series_PuzzleSeriesId",
                        column: x => x.PuzzleSeriesId,
                        principalTable: "Series",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "UserPuzzles",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    UserId = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    PuzzleId = table.Column<int>(type: "int", nullable: false),
                    IsOwned = table.Column<bool>(type: "bit", nullable: false),
                    IsCompleted = table.Column<bool>(type: "bit", nullable: false),
                    LastCompletedDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    TimesCompleted = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserPuzzles", x => x.Id);
                    table.ForeignKey(
                        name: "FK_UserPuzzles_AspNetUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_UserPuzzles_Puzzles_PuzzleId",
                        column: x => x.PuzzleId,
                        principalTable: "Puzzles",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Puzzles_BrandId",
                table: "Puzzles",
                column: "BrandId");

            migrationBuilder.CreateIndex(
                name: "IX_Puzzles_BrandId1",
                table: "Puzzles",
                column: "BrandId1");

            migrationBuilder.CreateIndex(
                name: "IX_Puzzles_IllustratorId",
                table: "Puzzles",
                column: "IllustratorId");

            migrationBuilder.CreateIndex(
                name: "IX_Puzzles_PuzzleSeriesId",
                table: "Puzzles",
                column: "PuzzleSeriesId");

            migrationBuilder.CreateIndex(
                name: "IX_Series_BrandId",
                table: "Series",
                column: "BrandId");

            migrationBuilder.CreateIndex(
                name: "IX_UserPuzzles_PuzzleId",
                table: "UserPuzzles",
                column: "PuzzleId");

            migrationBuilder.CreateIndex(
                name: "IX_UserPuzzles_UserId",
                table: "UserPuzzles",
                column: "UserId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "UserPuzzles");

            migrationBuilder.DropTable(
                name: "Puzzles");

            migrationBuilder.DropTable(
                name: "Illustrators");

            migrationBuilder.DropTable(
                name: "Series");

            migrationBuilder.DropTable(
                name: "Brands");

            migrationBuilder.DropColumn(
                name: "DisplayName",
                table: "AspNetUsers");
        }
    }
}
