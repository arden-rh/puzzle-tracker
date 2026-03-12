namespace PuzzleTracker.Server.Data.DTOs
{
    public class UpdateUserPuzzleDto
    {
        public bool IsOwned { get; set; }
        public bool IsCompleted { get; set; }
        public int TimesCompleted { get; set; }
        public DateTime? LastCompletedDate { get; set; }
    }
}
