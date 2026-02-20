namespace PuzzleTracker.Server.Models
{
    public class UserPuzzle
    {
        public int Id { get; set; }
        public string UserId { get; set; }
        public ApplicationUser User { get; set; }

        public int PuzzleId { get; set; }
        public PuzzleBase Puzzle { get; set; }

        public bool IsOwned { get; set; } = false;
        public bool IsCompleted { get; set; } = false;
        public DateTime? LastCompletedDate { get; set; }
        public int TimesCompleted { get; set; } = 0;
    }
}
