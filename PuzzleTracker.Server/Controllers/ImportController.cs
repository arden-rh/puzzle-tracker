using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PuzzleTracker.Server.Data;
using PuzzleTracker.Server.Services;
using Microsoft.EntityFrameworkCore;

namespace PuzzleTracker.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ImportController : ControllerBase
    {
        private readonly ExcelImportService _importService;
        private readonly IWebHostEnvironment _environment;
        private readonly PuzzleTrackerContext _context;

        public ImportController(ExcelImportService importService, IWebHostEnvironment environment, PuzzleTrackerContext context)
        {
            _importService = importService;
            _environment = environment;
            _context = context;
        }

        [HttpDelete("clear-data")]
        public async Task<IActionResult> ClearData()
        {
            try
            {
                // Delete in reverse order of dependencies
                var userPuzzlesDeleted = await _context.UserPuzzles.ExecuteDeleteAsync();
                var puzzlesDeleted = await _context.Puzzles.ExecuteDeleteAsync();
                var seriesDeleted = await _context.Series.ExecuteDeleteAsync();
                var illustratorsDeleted = await _context.Illustrators.ExecuteDeleteAsync();
                var brandsDeleted = await _context.Brands.ExecuteDeleteAsync();

                // Reset identity seeds
                await _context.Database.ExecuteSqlRawAsync("DBCC CHECKIDENT ('UserPuzzles', RESEED, 0)");
                await _context.Database.ExecuteSqlRawAsync("DBCC CHECKIDENT ('Puzzles', RESEED, 0)");
                await _context.Database.ExecuteSqlRawAsync("DBCC CHECKIDENT ('Series', RESEED, 0)");
                await _context.Database.ExecuteSqlRawAsync("DBCC CHECKIDENT ('Illustrators', RESEED, 0)");
                await _context.Database.ExecuteSqlRawAsync("DBCC CHECKIDENT ('Brands', RESEED, 0)");

                return Ok(new
                {
                    success = true,
                    message = "Database cleared successfully",
                    deleted = new
                    {
                        userPuzzles = userPuzzlesDeleted,
                        puzzles = puzzlesDeleted,
                        series = seriesDeleted,
                        illustrators = illustratorsDeleted,
                        brands = brandsDeleted
                    }
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new
                {
                    success = false,
                    message = "Failed to clear database",
                    error = ex.Message
                });
            }
        }

        [HttpPost("upload-excel")]
        public async Task<IActionResult> UploadExcel(IFormFile file)
        {
            if (file == null || file.Length == 0)
            {
                return BadRequest("No file uploaded");
            }

            if (!file.FileName.EndsWith(".xlsx", StringComparison.OrdinalIgnoreCase))
            {
                return BadRequest("Only .xlsx files are supported");
            }

            var uploadsFolder = Path.Combine(_environment.ContentRootPath, "Uploads");
            Directory.CreateDirectory(uploadsFolder);

            var filePath = Path.Combine(uploadsFolder, file.FileName);

            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            var result = await _importService.ImportFromExcel(filePath);

            // Clean up the uploaded file
            if (System.IO.File.Exists(filePath))
            {
                System.IO.File.Delete(filePath);
            }

            if (result.Success)
            {
                return Ok(result);
            }
            else
            {
                return BadRequest(result);
            }
        }

        [HttpPost("import-from-path")]
        [Authorize] // Protect this endpoint - only for dev/admin use
        public async Task<IActionResult> ImportFromPath([FromBody] ImportPathRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.FilePath))
            {
                return BadRequest("File path is required");
            }

            if (!System.IO.File.Exists(request.FilePath))
            {
                return NotFound($"File not found: {request.FilePath}");
            }

            var result = await _importService.ImportFromExcel(request.FilePath);

            if (result.Success)
            {
                return Ok(result);
            }
            else
            {
                return BadRequest(result);
            }
        }
    }

    public class ImportPathRequest
    {
        public string FilePath { get; set; }
    }
}
