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

        /* GET USER COLLECTION */
        [HttpGet("my-collection")]
        public async Task<ActionResult<PaginatedResult<UserPuzzleDto>>> GetUserCollection(
            [FromQuery] string? searchQuery = null,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 10)
        {
            var userId = _userManager.GetUserId(User);

            // Get all puzzles as a queryable to allow for dynamic filtering
            var query = _context.UserPuzzles.AsQueryable();

            // Search functionality - searches across multiple fields
            if (!string.IsNullOrEmpty(searchQuery))
            {
                var searchTerm = searchQuery.ToLower();
                query = query.Where(p =>
                    p.Puzzle.NameEnglish.ToLower().Contains(searchTerm) ||
                    (p.Puzzle.NameLocal != null && p.Puzzle.NameLocal.ToLower().Contains(searchTerm)) ||
                    (p.Puzzle.ProductNumber != null && p.Puzzle.ProductNumber.ToLower().Contains(searchTerm)) ||
                    p.Puzzle.Brand.Name.ToLower().Contains(searchTerm) ||
                    (p.Puzzle.Series != null && p.Puzzle.Series.Name.ToLower().Contains(searchTerm)) ||
                    (p.Puzzle.Illustrator != null && p.Puzzle.Illustrator.Name.ToLower().Contains(searchTerm))
                );
            }

            var collection = await query
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
            if (pageSize < 1) pageSize = 10;
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

        /* GET SPECIFIC PUZZLE FROM USER COLLECTION */
        [HttpGet("my-collection/{puzzleId}")]
        public async Task<ActionResult<UserPuzzleDto>> GetCollectionEntry(int puzzleId)
        {
            var userId = _userManager.GetUserId(User);
            var userPuzzle = await _context.UserPuzzles
                .Where(up => up.PuzzleId == puzzleId && up.UserId == userId)
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

        /* CHECK IF PUZZLE IS IN USER COLLECTION */
        [HttpGet("check/{puzzleId}")]
        public async Task<ActionResult<bool>> CheckIfInCollection(int puzzleId)
        {
            var userId = _userManager.GetUserId(User);
            var exists = await _context.UserPuzzles
                .AnyAsync(up => up.UserId == userId && up.PuzzleId == puzzleId);
            return Ok(exists);
        }

        /* ADD PUZZLE TO USER COLLECTION */
        // This is for adding existing puzzles from the main catalog, not for creating new custom puzzles
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

        /* UPDATE COLLECTION ENTRY */
        [HttpPost("update/{puzzleId}")]
        public async Task<ActionResult> UpdateCollectionEntry(int puzzleId, [FromBody] UserPuzzleDto updatedData)
        {
            var userId = _userManager.GetUserId(User);
            var userPuzzle = await _context.UserPuzzles
                .Include(up => up.Puzzle)
                .FirstOrDefaultAsync(up => up.PuzzleId == puzzleId && up.UserId == userId);
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

        /* MARK PUZZLE AS COMPLETED */
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

        /* MARK PUZZLE AS INCOMPLETE */
        // this will decrement the times completed and update the last completed date
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
        
        /* TOGGLE PUZZLE OWNERSHIP */
        // Toggle ownership status - if the puzzle is not in the collection, it will be added with IsOwned = true. If it is already in the collection, it will toggle the IsOwned status.
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
        
        /* REMOVE PUZZLE FROM COLLECTION */
        // Remove a puzzle from the user's collection - this will delete the UserPuzzle entry for that puzzle
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

        /* CUSTOM PUZZLE MANAGEMENT */

        /* CREATE CUSTOM PUZZLE */
        [HttpPost("custom/create")]
        public async Task<ActionResult> AddCustomPuzzle([FromBody] UserCustomPuzzleDto customPuzzleData)
        {
            var userId = _userManager.GetUserId(User);

            // Get or create Brand
            var brand = await _context.Brands.FirstOrDefaultAsync(b => b.Name == customPuzzleData.BrandName);
            if (brand == null)
            {
                brand = new Brand { Name = customPuzzleData.BrandName };
                _context.Brands.Add(brand);
                await _context.SaveChangesAsync();
            }

            // Get or create Series (optional)
            int? seriesId = null;
            if (!string.IsNullOrEmpty(customPuzzleData.SeriesName))
            {
                var series = await _context.Series.FirstOrDefaultAsync(s => s.Name == customPuzzleData.SeriesName && s.BrandId == brand.Id);
                if (series == null)
                {
                    series = new PuzzleSeries { Name = customPuzzleData.SeriesName, BrandId = brand.Id };
                    _context.Series.Add(series);
                    await _context.SaveChangesAsync();
                }
                seriesId = series.Id;
            }

            // Get or create Illustrator (optional)
            int? illustratorId = null;
            if (!string.IsNullOrEmpty(customPuzzleData.IllustratorName))
            {
                var illustrator = await _context.Illustrators.FirstOrDefaultAsync(i => i.Name == customPuzzleData.IllustratorName);
                if (illustrator == null)
                {
                    illustrator = new Illustrator { Name = customPuzzleData.IllustratorName };
                    _context.Illustrators.Add(illustrator);
                    await _context.SaveChangesAsync();
                }
                illustratorId = illustrator.Id;
            }

            // Calculate SortablePieceCount from NumberOfPieces
            var sortablePieceCount = ParsePieceCount(customPuzzleData.NumberOfPieces);

            // Create a new UserCustomPuzzle
            var customPuzzle = new UserCustomPuzzle
            {
                NameEnglish = customPuzzleData.NameEnglish,
                NameLocal = customPuzzleData.NameLocal,
                LocalLanguage = customPuzzleData.LocalLanguage,
                ProductNumber = customPuzzleData.ProductNumber,
                NumberOfPieces = customPuzzleData.NumberOfPieces,
                SortablePieceCount = sortablePieceCount,
                BoxImgSrc = customPuzzleData.BoxImgSrc,
                BrandId = brand.Id,
                PuzzleSeriesId = seriesId,
                IllustratorId = illustratorId,
                CreatedByUserId = userId,
                DateAdded = DateTime.Now,
                IsPublic = customPuzzleData.IsPublic
            };

            _context.CustomPuzzles.Add(customPuzzle);
            await _context.SaveChangesAsync();

            // Add the custom puzzle to the user's collection
            var userPuzzle = new UserPuzzle
            {
                UserId = userId,
                PuzzleId = customPuzzle.Id,
                IsOwned = true,
                IsCompleted = false,
                TimesCompleted = 0,
                LastCompletedDate = null
            };

            _context.UserPuzzles.Add(userPuzzle);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Custom puzzle added to your collection.", puzzleId = customPuzzle.Id, userPuzzleId = userPuzzle.Id });
        }

        /* EDIT CUSTOM PUZZLE */
        [HttpPost("custom/edit/{puzzleId}")]
        public async Task<ActionResult> EditCustomPuzzle(int puzzleId, [FromBody] UserCustomPuzzleDto updatedData)
        {
            var userId = _userManager.GetUserId(User);
            var customPuzzle = await _context.CustomPuzzles
                .FirstOrDefaultAsync(cp => cp.Id == puzzleId && cp.CreatedByUserId == userId);
            if (customPuzzle == null)
                return NotFound("Custom puzzle not found.");

            // Get or create Brand
            var brand = await _context.Brands.FirstOrDefaultAsync(b => b.Name == updatedData.BrandName);
            if (brand == null)
            {
                brand = new Brand { Name = updatedData.BrandName };
                _context.Brands.Add(brand);
                await _context.SaveChangesAsync();
            }

            // Get or create Series (optional)
            int? seriesId = null;
            if (!string.IsNullOrEmpty(updatedData.SeriesName))
            {
                var series = await _context.Series.FirstOrDefaultAsync(s => s.Name == updatedData.SeriesName && s.BrandId == brand.Id);
                if (series == null)
                {
                    series = new PuzzleSeries { Name = updatedData.SeriesName, BrandId = brand.Id };
                    _context.Series.Add(series);
                    await _context.SaveChangesAsync();
                }
                seriesId = series.Id;
            }

            // Get or create Illustrator (optional)
            int? illustratorId = null;
            if (!string.IsNullOrEmpty(updatedData.IllustratorName))
            {
                var illustrator = await _context.Illustrators.FirstOrDefaultAsync(i => i.Name == updatedData.IllustratorName);
                if (illustrator == null)
                {
                    illustrator = new Illustrator { Name = updatedData.IllustratorName };
                    _context.Illustrators.Add(illustrator);
                    await _context.SaveChangesAsync();
                }
                illustratorId = illustrator.Id;
            }

            // Update the custom puzzle with the provided data
            customPuzzle.NameEnglish = updatedData.NameEnglish;
            customPuzzle.NameLocal = updatedData.NameLocal;
            customPuzzle.LocalLanguage = updatedData.LocalLanguage;
            customPuzzle.ProductNumber = updatedData.ProductNumber;
            customPuzzle.NumberOfPieces = updatedData.NumberOfPieces;
            customPuzzle.SortablePieceCount = ParsePieceCount(updatedData.NumberOfPieces);
            customPuzzle.BoxImgSrc = updatedData.BoxImgSrc;
            customPuzzle.IsPublic = updatedData.IsPublic;
            await _context.SaveChangesAsync();
            return Ok("Custom puzzle edited.");
        }

        /* DELETE CUSTOM PUZZLE */
        [HttpDelete("custom/delete/{puzzleId}")]
        public async Task<ActionResult> DeleteCustomPuzzle(int puzzleId)
        {
            var userId = _userManager.GetUserId(User);
            var customPuzzle = await _context.CustomPuzzles
                .FirstOrDefaultAsync(cp => cp.Id == puzzleId && cp.CreatedByUserId == userId);
            if (customPuzzle == null)
                return NotFound("Custom puzzle not found.");
            // Remove the custom puzzle from all user collections
            var userPuzzles = await _context.UserPuzzles
                .Where(up => up.PuzzleId == puzzleId)
                .ToListAsync();
            _context.UserPuzzles.RemoveRange(userPuzzles);
            // Remove the custom puzzle itself
            _context.CustomPuzzles.Remove(customPuzzle);
            await _context.SaveChangesAsync();
            return Ok("Custom puzzle deleted.");
        }

        /* HELPER */
        private static int ParsePieceCount(string numberOfPieces)
        {
            if (string.IsNullOrEmpty(numberOfPieces))
                return 0;

            // Remove common text and extract first number
            var cleaned = numberOfPieces.Trim().Split(' ')[0].Replace(",", "");

            if (int.TryParse(cleaned, out var count))
                return count;

            return 0;
        }

    }
}
