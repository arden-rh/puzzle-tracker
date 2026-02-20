using Microsoft.AspNetCore.Identity;

namespace PuzzleTracker.Server.Models
{
    public class ApplicationUser : IdentityUser
    {
        public string? DisplayName { get; set; }
        public ICollection<UserPuzzle> UserPuzzles { get; set; } = new List<UserPuzzle>();
    }
}
