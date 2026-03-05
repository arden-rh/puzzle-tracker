using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PuzzleTracker.Server.Data;
using PuzzleTracker.Server.Data.DTOs;
using PuzzleTracker.Server.Models;

namespace PuzzleTracker.Server.Controllers
{

    [Authorize]
    [Route("api/user-puzzles")]
    [ApiController]
    [EnableCors("AllowClient")]
    public class UserPuzzleController : Controller
    {
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly PuzzleTrackerContext _context;

        public UserPuzzleController(UserManager<ApplicationUser> userManager, PuzzleTrackerContext context)
        {
            _userManager = userManager;
            _context = context;
        }

        [HttpGet("my-collection")]
        public async Task<ActionResult<PaginatedResult<UserPuzzleDto>>> GetUserCollection(
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 20)
        {
            var userId = _userManager.GetUserId(User);

            var collection = await _context.UserPuzzles
                .Where(up => up.UserId == userId)
                .Select(up => new UserPuzzleDto
                {
                    UserPuzzleId = up.Id,
                    IsOwned = up.IsOwned,
                    IsCompleted = up.IsCompleted,
                    TimesCompleted = up.TimesCompleted,
                    LastCompletedDate = up.LastCompletedDate,

                    PuzzleId = up.Puzzle.Id,
                    NameEnglish = up.Puzzle.NameEnglish,
                    NameLocal = up.Puzzle.NameLocal,
                    LocalLanguage = up.Puzzle.LocalLanguage,
                    ProductNumber = up.Puzzle.ProductNumber,
                    NumberOfPieces = up.Puzzle.NumberOfPieces,
                    SortablePieceCount = up.Puzzle.SortablePieceCount,
                    BoxImgSrc = up.Puzzle.BoxImgSrc,
                    BrandName = up.Puzzle.Brand.Name,
                    SeriesName = up.Puzzle.Series != null ? up.Puzzle.Series.Name : null,
                    IllustratorName = up.Puzzle.Illustrator != null ? up.Puzzle.Illustrator.Name : null,

                    // This pulls the Discriminator value automatically
                    PuzzleType = EF.Property<string>(up.Puzzle, "PuzzleType"),

                    // Logic for specific types
                    Publisher = (up.Puzzle is OfficialPuzzle) ? ((OfficialPuzzle)up.Puzzle).Publisher : (up.Puzzle is JVHPuzzle) ? ((JVHPuzzle)up.Puzzle).Publisher : null,
                    ReleaseDate = (up.Puzzle is OfficialPuzzle) ? ((OfficialPuzzle)up.Puzzle).ReleaseDate : (up.Puzzle is JVHPuzzle) ? ((JVHPuzzle)up.Puzzle).ReleaseDate : null,
                    Manufacturer = (up.Puzzle is OfficialPuzzle) ? ((OfficialPuzzle)up.Puzzle).Manufacturer : (up.Puzzle is JVHPuzzle) ? ((JVHPuzzle)up.Puzzle).Manufacturer : null,
                    IsComboPack = (up.Puzzle is JVHPuzzle) && ((JVHPuzzle)up.Puzzle).IsComboPack,

                    CreatedByUserId = (up.Puzzle is UserCustomPuzzle) ? ((UserCustomPuzzle)up.Puzzle).CreatedByUserId : null,
                    DateAdded = (up.Puzzle is UserCustomPuzzle) ? ((UserCustomPuzzle)up.Puzzle).DateAdded : DateTime.Today,
                    IsPublic = (up.Puzzle is UserCustomPuzzle) ? ((UserCustomPuzzle)up.Puzzle).IsPublic : false

                })
                .ToListAsync();

            // Get total count before pagination
            var totalCount = collection.Count;

            // Ensure valid pagination parameters
            if (page < 1) page = 1;
            if (pageSize < 1) pageSize = 20;
            if (pageSize > 100) pageSize = 100; // Max page size to prevent abuse

            // Apply pagination
            var paginatedCollection = collection
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToList();

            var result = new PaginatedResult<UserPuzzleDto>
            {
                Items = paginatedCollection,
                TotalCount = totalCount,
                Page = page,
                PageSize = pageSize,
                TotalPages = (int)Math.Ceiling(totalCount / (double)pageSize)
            };

            return Ok(result);
        }

        [HttpGet("my-collection/{userPuzzleId}")]
        public async Task<ActionResult<UserPuzzleDto>> GetCollectionEntry(int userPuzzleId)
        {
            var userId = _userManager.GetUserId(User);
            var userPuzzle = await _context.UserPuzzles
                .Where(up => up.Id == userPuzzleId && up.UserId == userId)
                .Select(up => new UserPuzzleDto
                {
                    UserPuzzleId = up.Id,
                    IsOwned = up.IsOwned,
                    IsCompleted = up.IsCompleted,
                    TimesCompleted = up.TimesCompleted,
                    LastCompletedDate = up.LastCompletedDate,
                    PuzzleId = up.Puzzle.Id,
                    NameEnglish = up.Puzzle.NameEnglish,
                    NameLocal = up.Puzzle.NameLocal,
                    LocalLanguage = up.Puzzle.LocalLanguage,
                    ProductNumber = up.Puzzle.ProductNumber,
                    NumberOfPieces = up.Puzzle.NumberOfPieces,
                    SortablePieceCount = up.Puzzle.SortablePieceCount,
                    BoxImgSrc = up.Puzzle.BoxImgSrc,
                    BrandName = up.Puzzle.Brand.Name,
                    SeriesName = up.Puzzle.Series != null ? up.Puzzle.Series.Name : null,
                    IllustratorName = up.Puzzle.Illustrator != null ? up.Puzzle.Illustrator.Name : null,
                    // This pulls the Discriminator value automatically
                    PuzzleType = EF.Property<string>(up.Puzzle, "PuzzleType"),
                    // Logic for specific types
                    Publisher = (up.Puzzle is OfficialPuzzle) ? ((OfficialPuzzle)up.Puzzle).Publisher : (up.Puzzle is JVHPuzzle) ? ((JVHPuzzle)up.Puzzle).Publisher : null,
                    ReleaseDate = (up.Puzzle is OfficialPuzzle) ? ((OfficialPuzzle)up.Puzzle).ReleaseDate : (up.Puzzle is JVHPuzzle) ? ((JVHPuzzle)up.Puzzle).ReleaseDate : null,
                    Manufacturer = (up.Puzzle is OfficialPuzzle) ? ((OfficialPuzzle)up.Puzzle).Manufacturer : (up.Puzzle is JVHPuzzle) ? ((JVHPuzzle)up.Puzzle).Manufacturer : null,
                    IsComboPack = (up.Puzzle is JVHPuzzle) && ((JVHPuzzle)up.Puzzle).IsComboPack,
                    CreatedByUserId = (up.Puzzle is UserCustomPuzzle) ? ((UserCustomPuzzle)up.Puzzle).CreatedByUserId : null,
                    DateAdded = (up.Puzzle is UserCustomPuzzle) ? ((UserCustomPuzzle)up.Puzzle).DateAdded : null
                })
                .FirstOrDefaultAsync();
            if (userPuzzle == null)
                return NotFound("Puzzle not found in your collection.");
            return Ok(userPuzzle);
        }

        // Check if a specific puzzle is in the user's collection
        [HttpGet("check/{puzzleId}")]
        public async Task<ActionResult<bool>> CheckIfInCollection(int puzzleId)
        {
            var userId = _userManager.GetUserId(User);
            var exists = await _context.UserPuzzles
                .AnyAsync(up => up.UserId == userId && up.PuzzleId == puzzleId);
            return Ok(exists);
        }

        // Add puzzle to collection - this is for adding existing puzzles from the main catalog, not for creating new custom puzzles
        [HttpPost("add/{puzzleId}")]
        public async Task<ActionResult> AddToCollection(int puzzleId)
        {
            var userId = _userManager.GetUserId(User);
            // Check if the puzzle exists
            var puzzle = await _context.Puzzles.FindAsync(puzzleId);
            if (puzzle == null)
                return NotFound("Puzzle not found.");
            // Check if the user already has this puzzle in their collection
            var existingEntry = await _context.UserPuzzles
                .FirstOrDefaultAsync(up => up.UserId == userId && up.PuzzleId == puzzleId);
            if (existingEntry != null)
                return BadRequest("Puzzle is already in your collection.");
            // Add the puzzle to the user's collection
            var userPuzzle = new UserPuzzle
            {
                UserId = userId,
                PuzzleId = puzzleId,
                IsOwned = true,
                IsCompleted = false,
                TimesCompleted = 0,
                LastCompletedDate = null
            };
            _context.UserPuzzles.Add(userPuzzle);
            await _context.SaveChangesAsync();
            return Ok("Puzzle added to your collection.");
        }

        // 
        [HttpPost("update/{userPuzzleId}")]
        public async Task<ActionResult> UpdateCollectionEntry(int userPuzzleId, [FromBody] UserPuzzleDto updatedData)
        {
            var userId = _userManager.GetUserId(User);
            var userPuzzle = await _context.UserPuzzles
                .Include(up => up.Puzzle)
                .FirstOrDefaultAsync(up => up.Id == userPuzzleId && up.UserId == userId);
            if (userPuzzle == null)
                return NotFound("Collection entry not found.");
            // Update the collection entry with the provided data
            userPuzzle.IsOwned = updatedData.IsOwned;
            userPuzzle.IsCompleted = updatedData.IsCompleted;
            userPuzzle.TimesCompleted = updatedData.TimesCompleted;
            userPuzzle.LastCompletedDate = updatedData.LastCompletedDate;
            await _context.SaveChangesAsync();
            return Ok("Collection entry updated.");
        }

        // Mark a puzzle as completed - this will increment the times completed and update the last completed date
        [HttpPost("complete/{puzzleId}")]
        public async Task<ActionResult> MarkAsCompleted(int puzzleId)
        {
            var userId = _userManager.GetUserId(User);
            var userPuzzle = await _context.UserPuzzles
                .FirstOrDefaultAsync(up => up.PuzzleId == puzzleId && up.UserId == userId);
            if (userPuzzle == null)
            {
                userPuzzle = new UserPuzzle
                {
                    UserId = userId,
                    PuzzleId = puzzleId,
                    IsOwned = true,
                    IsCompleted = true,
                    TimesCompleted = 1,
                    LastCompletedDate = DateTime.Now
                };

                _context.UserPuzzles.Add(userPuzzle);
            }
            // Mark the puzzle as completed
            userPuzzle.IsCompleted = true;
            userPuzzle.TimesCompleted += 1;
            userPuzzle.LastCompletedDate = DateTime.Now;
            await _context.SaveChangesAsync();
            return Ok("Puzzle marked as completed.");
        }

        // Mark a puzzle as incomplete - this will decrement the times completed and update the last completed date
        [HttpPost("incomplete/{puzzleId}")]
        public async Task<ActionResult> MarkAsIncomplete(int puzzleId)
        {
            var userId = _userManager.GetUserId(User);
            var userPuzzle = await _context.UserPuzzles
                .FirstOrDefaultAsync(up => up.PuzzleId == puzzleId && up.UserId == userId);
            if (userPuzzle == null)
                return NotFound("Collection entry not found.");
            // Mark the puzzle as incomplete
            userPuzzle.IsCompleted = false;
            userPuzzle.TimesCompleted = Math.Max(0, userPuzzle.TimesCompleted - 1);
            userPuzzle.LastCompletedDate = userPuzzle.TimesCompleted > 0 ? DateTime.Now : (DateTime?)null;
            await _context.SaveChangesAsync();
            return Ok("Puzzle marked as incomplete.");
        }

        [HttpPost("toggle-owned/{puzzleId}")]
        public async Task<ActionResult> ToggleOwned(int puzzleId)
        {
            var userId = _userManager.GetUserId(User);
            var userPuzzle = await _context.UserPuzzles
                .FirstOrDefaultAsync(up => up.PuzzleId == puzzleId && up.UserId == userId);
            if (userPuzzle == null)
            {
                userPuzzle = new UserPuzzle
                {
                    UserId = userId,
                    PuzzleId = puzzleId,
                    IsOwned = true,
                    IsCompleted = false,
                    TimesCompleted = 0,
                    LastCompletedDate = null
                };

                _context.UserPuzzles.Add(userPuzzle);
            }
            else
            {
                userPuzzle.IsOwned = !userPuzzle.IsOwned;
            }

            await _context.SaveChangesAsync();
            return Ok("Puzzle ownership toggled.");
        }

        [HttpDelete("remove/{puzzleId}")]
        public async Task<ActionResult> RemoveFromCollection(int puzzleId)
        {
            var userId = _userManager.GetUserId(User);
            var userPuzzle = await _context.UserPuzzles
                .FirstOrDefaultAsync(up => up.PuzzleId == puzzleId && up.UserId == userId);
            if (userPuzzle == null)
                return NotFound("Collection entry not found.");
            _context.UserPuzzles.Remove(userPuzzle);
            await _context.SaveChangesAsync();
            return Ok("Puzzle removed from your collection.");
        }

    }
}
