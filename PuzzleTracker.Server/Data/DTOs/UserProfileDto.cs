namespace PuzzleTracker.Server.Data.DTOs
{
    public class UserProfileDto
    {
        public string Id { get; set; }
        public string Name { get; set; }
        public string Email { get; set; }

        // These are calculated fields that will be populated in the controller
        public int TotalPuzzlesOwned { get; set; }
        public int TotalPuzzlesCompleted { get; set; }
        public int TotalPuzzlesInCollection { get; set; }

        // Optional profile fields
        public string? DisplayName { get; set; }
        public string? ProfilePicUrl { get; set; }
        public string? Bio { get; set; }

    }
}
