using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PuzzleTracker.Server.Data;
using PuzzleTracker.Server.Data.DTOs;
using PuzzleTracker.Server.Models;


namespace PuzzleTracker.Server.Controllers
{
    public class PuzzleController : Controller
    {
        private readonly UserManager<IdentityUser> _userManager;
        private readonly PuzzleTrackerContext _context;

        public PuzzleController(UserManager<IdentityUser> userManager, PuzzleTrackerContext context)
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

                    IsInUserCollection = userId != null && _context.UserPuzzles.Any(up => up.UserId == userId && up.PuzzleId == p.Id)

                })
                .ToListAsync();

            return Ok(collection);
        }
    }
}
