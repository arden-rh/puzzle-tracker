using PuzzleTracker.Server.Models;

namespace PuzzleTracker.Server.Data
{
    public static class DatabaseSeeder
    {
        public static async Task SeedAsync(PuzzleTrackerContext context)
        {
            // Check if data already exists
            if (context.Brands.Any() || context.Puzzles.Any())
            {
                return; // Database already seeded
            }

            // Seed Brands
            var brands = new List<Brand>
            {
                new Brand { Name = "Jan van Haasteren", WebsiteUrl = "https://www.janvanhaasteren.nl" },
                new Brand { Name = "Ravensburger", WebsiteUrl = "https://www.ravensburger.com" }
            };
            await context.Brands.AddRangeAsync(brands);
            await context.SaveChangesAsync();

            // Seed Illustrators
            var illustrators = new List<Illustrator>
            {
                new Illustrator { Name = "Jan van Haasteren" },
                new Illustrator { Name = "Unknown Artist" }
            };
            await context.Illustrators.AddRangeAsync(illustrators);
            await context.SaveChangesAsync();

            // Seed JVH Puzzles
            var jvhPuzzles = new List<JVHPuzzle>
            {
                new JVHPuzzle
                {
                    NameEnglish = "The Pharmacy",
                    ProductNumber = "19157",
                    NumberOfPieces = "1000",
                    SortablePieceCount = 1000,
                    BrandId = brands[0].Id,
                    IllustratorId = illustrators[0].Id,
                    Publisher = "Jumbo Games",
                    ReleaseDate = "2018",
                    Manufacturer = "Jumbo",
                    IsComboPack = false
                },
                new JVHPuzzle
                {
                    NameEnglish = "The Kitchen",
                    ProductNumber = "19234",
                    NumberOfPieces = "1000",
                    SortablePieceCount = 1000,
                    BrandId = brands[0].Id,
                    IllustratorId = illustrators[0].Id,
                    Publisher = "Jumbo Games",
                    ReleaseDate = "2020",
                    Manufacturer = "Jumbo",
                    IsComboPack = false
                }
            };
            await context.JVHPuzzles.AddRangeAsync(jvhPuzzles);
            await context.SaveChangesAsync();

            // Seed Custom Puzzle 
            var customPuzzle = new UserCustomPuzzle
            {
                NameEnglish = "My Custom Fantasy Castle",
                NumberOfPieces = "500",
                SortablePieceCount = 500,
                BrandId = brands[1].Id,
                IllustratorId = illustrators[1].Id,
                CreatedByUserId = "bd318c0e-92f1-4a20-9c2c-93b43e25ac16",
                DateAdded = DateTime.UtcNow,
                IsPublic = true
            };
            await context.CustomPuzzles.AddAsync(customPuzzle);
            await context.SaveChangesAsync();

            Console.WriteLine("✅ Database seeded successfully with test data!");
        }
    }
}
