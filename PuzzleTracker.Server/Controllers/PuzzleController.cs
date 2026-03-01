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
        public async Task<ActionResult<IEnumerable<PuzzleDto>>> GetAllPuzzles()
        {

            var userId = _userManager.GetUserId(User);

            var collection = await _context.Puzzles
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
                    Manufacturer = (p is OfficialPuzzle) ? ((OfficialPuzzle)p).Manufacturer : (p is JVHPuzzle) ? ((JVHPuzzle)p).Manufacturer : null,
                    IsComboPack = (p is JVHPuzzle) && ((JVHPuzzle)p).IsComboPack,

                    IsInUserCollection = userId != null && _context.UserPuzzles.Any(up => up.UserId == userId && up.PuzzleId == p.Id),
                    IsCompletedByUser = userId != null && _context.UserPuzzles.Any(up => up.UserId == userId && up.PuzzleId == p.Id && up.IsCompleted)

                })
                .ToListAsync();

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
    }
}
