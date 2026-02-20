namespace PuzzleTracker.Server.Models
{
    public class Illustrator
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public ICollection<PuzzleBase> Puzzles { get; set; } = new List<PuzzleBase>();
    }
}
