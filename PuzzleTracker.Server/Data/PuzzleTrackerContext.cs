using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using PuzzleTracker.Server.Models;

namespace PuzzleTracker.Server.Data
{
    public class PuzzleTrackerContext : IdentityDbContext<ApplicationUser>
    {
        public PuzzleTrackerContext(DbContextOptions<PuzzleTrackerContext> options)
            : base(options)
        {
        }

        // Main table
        public DbSet<PuzzleBase> Puzzles { get; set; }
        // Separate tables for each puzzle type, but they will all be stored in the same table in the database with a discriminator column to differentiate between them.
        public DbSet<OfficialPuzzle> OfficialPuzzles { get; set; }
        public DbSet<JVHPuzzle> JVHPuzzles { get; set; }
        public DbSet<UserCustomPuzzle> CustomPuzzles { get; set; }
        
        // Related tables
        public DbSet<Brand> Brands { get; set; }
        public DbSet<PuzzleSeries> Series { get; set; }
        public DbSet<Illustrator> Illustrators { get; set; }

        // User puzzle tracking table
        public DbSet<UserPuzzle> UserPuzzles { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<PuzzleBase>()
                .HasDiscriminator<string>("PuzzleType")
                .HasValue<OfficialPuzzle>("Official")
                .HasValue<JVHPuzzle>("JVH")
                .HasValue<UserCustomPuzzle>("UserCustom");

            // A Series belongs to a Brand
            modelBuilder.Entity<PuzzleSeries>()
                .HasOne(s => s.Brand)
                .WithMany(b => b.Series)
                .HasForeignKey(s => s.BrandId)
                .OnDelete(DeleteBehavior.Restrict);

            // A Puzzle must have a Brand
            modelBuilder.Entity<PuzzleBase>()
                .HasOne(p => p.Brand)
                .WithMany(b => b.Puzzles)
                .HasForeignKey(p => p.BrandId)
                .OnDelete(DeleteBehavior.Restrict);

            // User Collection Tracking
            modelBuilder.Entity<UserPuzzle>()
                .HasOne(up => up.User)
                .WithMany(u => u.UserPuzzles)
                .HasForeignKey(up => up.UserId);

            modelBuilder.Entity<UserPuzzle>()
                .HasOne(up => up.Puzzle)
                .WithMany()
                .HasForeignKey(up => up.PuzzleId);
        }
    }
}
