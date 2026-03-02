using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PuzzleTracker.Server.Migrations
{
    /// <inheritdoc />
    public partial class MakeOfficialPuzzleFieldsNullable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "ComboPackDetails",
                table: "Puzzles",
                type: "nvarchar(max)",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ComboPackDetails",
                table: "Puzzles");
        }
    }
}
