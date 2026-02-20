using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PuzzleTracker.Server.Migrations
{
    /// <inheritdoc />
    public partial class FixBrandRelationship : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Puzzles_Brands_BrandId1",
                table: "Puzzles");

            migrationBuilder.DropIndex(
                name: "IX_Puzzles_BrandId1",
                table: "Puzzles");

            migrationBuilder.DropColumn(
                name: "BrandId1",
                table: "Puzzles");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "BrandId1",
                table: "Puzzles",
                type: "int",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Puzzles_BrandId1",
                table: "Puzzles",
                column: "BrandId1");

            migrationBuilder.AddForeignKey(
                name: "FK_Puzzles_Brands_BrandId1",
                table: "Puzzles",
                column: "BrandId1",
                principalTable: "Brands",
                principalColumn: "Id");
        }
    }
}
