using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PuzzleTracker.Server.Data;
using PuzzleTracker.Server.Data.DTOs;
using PuzzleTracker.Server.Models;


namespace PuzzleTracker.Server.Controllers
{

    [Route("api")]
    [ApiController]
    [EnableCors("AllowClient")]
    public class PuzzleController : ControllerBase
    {
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly PuzzleTrackerContext _context;

        public PuzzleController(UserManager<ApplicationUser> userManager, PuzzleTrackerContext context)
        {
            _userManager = userManager;
            _context = context;
        }

        [HttpGet("puzzles")]
        public async Task<ActionResult<IEnumerable<PuzzleDto>>> GetAllPuzzles(
            [FromQuery] string? sortBy = null,
            [FromQuery] string? sortOrder = "asc",
            [FromQuery] string? puzzleType = null,
            [FromQuery] string? brand = null,
            [FromQuery] string? series = null,
            [FromQuery] string? illustrator = null,
            [FromQuery] string? pieceRanges = null,
            [FromQuery] bool? inCollection = null,
            [FromQuery] bool? isCompleted = null)
        {

            var userId = _userManager.GetUserId(User);

            // Get all puzzles as a queryable to allow for dynamic filtering
            var query = _context.Puzzles.AsQueryable();

            // Filtering
            if (!string.IsNullOrEmpty(puzzleType) && puzzleType != "all")
            {
                if (puzzleType == "official-p")
                    query = query.Where(p => p is OfficialPuzzle);
                else if (puzzleType == "user-p")
                    query = query.Where(p => !(p is OfficialPuzzle || p is JVHPuzzle));
            }

            if (!string.IsNullOrEmpty(brand) && brand != "all-brands")
            {
                query = query.Where(p => p.Brand.Name == brand);
            }

            if (!string.IsNullOrEmpty(series))
            {
                var seriesNames = series.Split(',', StringSplitOptions.RemoveEmptyEntries);
                if (seriesNames.Length > 0)
                {
                    query = query.Where(p => p.Series != null && seriesNames.Contains(p.Series.Name));
                }
            }

            if (!string.IsNullOrEmpty(illustrator))
            {
                var illustratorNames = illustrator.Split(',', StringSplitOptions.RemoveEmptyEntries);
                if (illustratorNames.Length > 0)
                {
                    query = query.Where(p => p.Illustrator != null && illustratorNames.Contains(p.Illustrator.Name));
                }
            }

            if (!string.IsNullOrEmpty(pieceRanges))
            {
                var ranges = pieceRanges.Split(',', StringSplitOptions.RemoveEmptyEntries);
                var piecePredicates = new List<Func<PuzzleDto, bool>>();

                foreach (var range in ranges)
                {
                    switch (range)
                    {
                        case "0-100":
                            query = query.Where(p => p.SortablePieceCount >= 0 && p.SortablePieceCount <= 100);
                            break;
                        case "100-500":
                            query = query.Where(p => p.SortablePieceCount > 100 && p.SortablePieceCount <= 500);
                            break;
                        case "500-1000":
                            query = query.Where(p => p.SortablePieceCount > 500 && p.SortablePieceCount <= 1000);
                            break;
                        case "1000-3000":
                            query = query.Where(p => p.SortablePieceCount > 1000 && p.SortablePieceCount <= 3000);
                            break;
                        case "3000+":
                            query = query.Where(p => p.SortablePieceCount > 3000 && p.SortablePieceCount <= 10000);
                            break;
                        case "combo-box":
                            query = query.Where(p => p.SortablePieceCount > 10000);
                            break;
                    }
                }
            }

            var collection = await query
                .Select(p => new PuzzleDto
                {
                    Id = p.Id,
                    NameEnglish = p.NameEnglish,
                    NameLocal = p.NameLocal,
                    LocalLanguage = p.LocalLanguage,
                    ProductNumber = p.ProductNumber,
                    NumberOfPieces = p.NumberOfPieces,
                    SortablePieceCount = p.SortablePieceCount,
                    BoxImgSrc = p.BoxImgSrc,
                    BrandName = p.Brand.Name,
                    SeriesName = p.Series != null ? p.Series.Name : null,
                    IllustratorName = p.Illustrator != null ? p.Illustrator.Name : null,

                    // This pulls the Discriminator value automatically
                    PuzzleType = EF.Property<string>(p, "PuzzleType"),

                    // Logic for specific types
                    Publisher = (p is OfficialPuzzle) ? ((OfficialPuzzle)p).Publisher : (p is JVHPuzzle) ? ((JVHPuzzle)p).Publisher : null,
                    ReleaseDate = (p is OfficialPuzzle) ? ((OfficialPuzzle)p).ReleaseDate : (p is JVHPuzzle) ? ((JVHPuzzle)p).ReleaseDate : null,
                    SortableReleaseDate = ParseReleaseDate((p is OfficialPuzzle) ? ((OfficialPuzzle)p).ReleaseDate : (p is JVHPuzzle) ? ((JVHPuzzle)p).ReleaseDate : null),
                    Manufacturer = (p is OfficialPuzzle) ? ((OfficialPuzzle)p).Manufacturer : (p is JVHPuzzle) ? ((JVHPuzzle)p).Manufacturer : null,
                    IsComboPack = (p is JVHPuzzle) && ((JVHPuzzle)p).IsComboPack,

                    IsInUserCollection = userId != null && _context.UserPuzzles.Any(up => up.UserId == userId && up.PuzzleId == p.Id),
                    IsCompletedByUser = userId != null && _context.UserPuzzles.Any(up => up.UserId == userId && up.PuzzleId == p.Id && up.IsCompleted)

                })
                .ToListAsync();

            // Apply default sorting by date descending (newest first, "Unknown" at bottom)
            collection = collection.OrderByDescending(p => p.SortableReleaseDate ?? DateTime.MinValue).ToList();

            // Sorting (done after projection to avoid EF translation issues)
            if (!string.IsNullOrEmpty(sortBy))
            {
                collection = sortBy.ToLower() switch
                {
                    "name" => sortOrder?.ToLower() == "desc" 
                        ? collection.OrderByDescending(p => p.NameEnglish).ToList()
                        : collection.OrderBy(p => p.NameEnglish).ToList(),
                    "pieces" => sortOrder?.ToLower() == "desc"
                        ? collection.OrderByDescending(p => p.SortablePieceCount).ToList()
                        : collection.OrderBy(p => p.SortablePieceCount).ToList(),
                    "date" => sortOrder?.ToLower() == "desc"
                        ? collection.OrderByDescending(p => 
                            string.IsNullOrEmpty(p.ReleaseDate) || p.ReleaseDate.Equals("Unknown", StringComparison.OrdinalIgnoreCase) 
                                ? DateTime.MinValue 
                                : DateTime.TryParse(p.ReleaseDate, out var date) ? date : DateTime.MinValue)
                          .ToList()
                        : collection.OrderBy(p => p.SortableReleaseDate ?? DateTime.MinValue).ToList(),
                    _ => collection
                };
            }

            // Filter by collection status (done in memory due to subquery complexity)
            if (userId != null)
            {
                if (inCollection.HasValue && inCollection.Value)
                {
                    collection = collection.Where(p => p.IsInUserCollection).ToList();
                }
                if (isCompleted.HasValue && isCompleted.Value)
                {
                    collection = collection.Where(p => p.IsCompletedByUser).ToList();
                }
            }

            return Ok(collection);
        }

        [HttpGet("puzzles/{id}")]
        public async Task<ActionResult<PuzzleDto>> GetPuzzleById(int id)
        {
            var userId = _userManager.GetUserId(User);
            var puzzle = await _context.Puzzles
                .Where(p => p.Id == id)
                .Select(p => new PuzzleDto
                {
                    Id = p.Id,
                    NameEnglish = p.NameEnglish,
                    NameLocal = p.NameLocal,
                    LocalLanguage = p.LocalLanguage,
                    ProductNumber = p.ProductNumber,
                    NumberOfPieces = p.NumberOfPieces,
                    SortablePieceCount = p.SortablePieceCount,
                    BoxImgSrc = p.BoxImgSrc,
                    BrandName = p.Brand.Name,
                    SeriesName = p.Series != null ? p.Series.Name : null,
                    IllustratorName = p.Illustrator != null ? p.Illustrator.Name : null,
                    // This pulls the Discriminator value automatically
                    PuzzleType = EF.Property<string>(p, "PuzzleType"),
                    // Logic for specific types
                    Publisher = (p is OfficialPuzzle) ? ((OfficialPuzzle)p).Publisher : (p is JVHPuzzle) ? ((JVHPuzzle)p).Publisher : null,
                    ReleaseDate = (p is OfficialPuzzle) ? ((OfficialPuzzle)p).ReleaseDate : (p is JVHPuzzle) ? ((JVHPuzzle)p).ReleaseDate : null,
                    SortableReleaseDate = ParseReleaseDate((p is OfficialPuzzle) ? ((OfficialPuzzle)p).ReleaseDate : (p is JVHPuzzle) ? ((JVHPuzzle)p).ReleaseDate : null),
                    Manufacturer = (p is OfficialPuzzle) ? ((OfficialPuzzle)p).Manufacturer : (p is JVHPuzzle) ? ((JVHPuzzle)p).Manufacturer : null,
                    IsComboPack = (p is JVHPuzzle) && ((JVHPuzzle)p).IsComboPack,
                    IsInUserCollection = userId != null && _context.UserPuzzles.Any(up => up.UserId == userId && up.PuzzleId == p.Id),
                    IsCompletedByUser = userId != null && _context.UserPuzzles.Any(up => up.UserId == userId && up.PuzzleId == p.Id && up.IsCompleted)
                })
                .FirstOrDefaultAsync();
            if (puzzle == null)
            {
                return NotFound();
            }
            return Ok(puzzle);

        }

        private static DateTime? ParseReleaseDate(string? releaseDate)
        {
            if (string.IsNullOrEmpty(releaseDate) || releaseDate.Equals("Unknown", StringComparison.OrdinalIgnoreCase))
            {
                return null;
            }

            // Try to parse as full date first
            if (DateTime.TryParse(releaseDate, out var fullDate))
            {
                return fullDate;
            }

            // If it's just a year (4 digits), convert to January 1st of that year
            if (int.TryParse(releaseDate.Trim(), out var year) && year >= 1000 && year <= 9999)
            {
                return new DateTime(year, 1, 1);
            }

            return null;
        }
    }
}
