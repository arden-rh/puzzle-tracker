namespace PuzzleTracker.Server.Models
{
    public class Brand
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string? WebsiteUrl { get; set; }
        public string? LogoImgSrc { get; set; }

        // Navigation properties
        public ICollection<PuzzleBase> Puzzles { get; set; } = new List<PuzzleBase>();
        public ICollection<PuzzleSeries> Series { get; set; } = new List<PuzzleSeries>();
    }
}
