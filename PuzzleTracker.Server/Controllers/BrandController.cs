using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PuzzleTracker.Server.Data;
using PuzzleTracker.Server.Data.DTOs;

namespace PuzzleTracker.Server.Controllers
{

    [Route("api")]
    [ApiController]
    [EnableCors("AllowClient")]
    public class BrandController : ControllerBase
    {
        private readonly PuzzleTrackerContext _context;

        public BrandController(PuzzleTrackerContext context)
        {
            _context = context;
        }

        [HttpGet("brands")]
        public async Task<ActionResult<IEnumerable<BrandDto>>> GetAllBrands()
        {
            var collection = await _context.Brands
                .Select(b => new BrandDto
                {
                    Id = b.Id,
                    Name = b.Name,
                    WebsiteUrl = b.WebsiteUrl,
                    LogoImgSrc = b.LogoImgSrc,

                })
                .ToListAsync();

            return Ok(collection);
        }
    }
}
