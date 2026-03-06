namespace PuzzleTracker.Server.Data.DTOs
{
    public class UpdateUserProfileDto
    {
        public string? DisplayName { get; set; }
        public string? ProfilePicUrl { get; set; }  
        public string? Bio { get; set; }
    }
}
