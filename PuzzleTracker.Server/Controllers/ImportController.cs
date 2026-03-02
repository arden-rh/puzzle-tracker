using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PuzzleTracker.Server.Services;

namespace PuzzleTracker.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ImportController : ControllerBase
    {
        private readonly ExcelImportService _importService;
        private readonly IWebHostEnvironment _environment;

        public ImportController(ExcelImportService importService, IWebHostEnvironment environment)
        {
            _importService = importService;
            _environment = environment;
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
