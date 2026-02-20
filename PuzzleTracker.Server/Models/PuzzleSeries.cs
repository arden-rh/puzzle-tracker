namespace PuzzleTracker.Server.Models
{
    public class PuzzleSeries
    {
        public int Id { get; set; }
        public string Name { get; set; }

        // Navigation property for related puzzles
        public int BrandId { get; set; }
        public Brand Brand { get; set; }

        public ICollection<PuzzleBase> Puzzles { get; set; } = new List<PuzzleBase>();
    }
}