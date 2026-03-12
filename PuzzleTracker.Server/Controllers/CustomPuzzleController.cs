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
    [Route("api/custom-puzzles")]
    [ApiController]
    [EnableCors("AllowClient")]
    public class CustomPuzzleController : Controller
    {
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly PuzzleTrackerContext _context;

        public CustomPuzzleController(UserManager<ApplicationUser> userManager, PuzzleTrackerContext context)
        {
            _userManager = userManager;
            _context = context;
        }

        /* GET ALL CUSTOM PUZZLES CREATED BY USER */
        [HttpGet]
        public async Task<ActionResult<List<UserCustomPuzzleDto>>> GetMyCustomPuzzles()
        {
            var userId = _userManager.GetUserId(User);
            var customPuzzles = await _context.CustomPuzzles
                .Where(cp => cp.CreatedByUserId == userId)
                .Select(cp => new UserCustomPuzzleDto
                {
                    NameEnglish = cp.NameEnglish,
                    NameLocal = cp.NameLocal,
                    LocalLanguage = cp.LocalLanguage,
                    ProductNumber = cp.ProductNumber,
                    NumberOfPieces = cp.NumberOfPieces,
                    BoxImgSrc = cp.BoxImgSrc,
                    BrandName = cp.Brand.Name,
                    SeriesName = cp.Series != null ? cp.Series.Name : null,
                    IllustratorName = cp.Illustrator != null ? cp.Illustrator.Name : null,
                    IsPublic = cp.IsPublic
                })
                .ToListAsync();
            return Ok(customPuzzles);
        }

        /* CREATE CUSTOM PUZZLE */
        [HttpPost]
        public async Task<ActionResult> CreateCustomPuzzle([FromBody] UserCustomPuzzleDto customPuzzleData)
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
        [HttpPut("edit/{puzzleId}")]
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
        [HttpDelete("delete/{puzzleId}")]
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
