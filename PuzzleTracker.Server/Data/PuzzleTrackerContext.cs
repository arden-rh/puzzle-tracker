using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace PuzzleTracker.Server.Data
{
    public class PuzzleTrackerContext : IdentityDbContext
    {
        public PuzzleTrackerContext(DbContextOptions<PuzzleTrackerContext> options)
            : base(options)
        {
        }
    }
}
