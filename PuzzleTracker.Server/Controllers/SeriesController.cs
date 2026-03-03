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
    public class SeriesController : ControllerBase
    {
        private readonly PuzzleTrackerContext _context;

        public SeriesController(PuzzleTrackerContext context)
        {
            _context = context;
        }

        [HttpGet("series")]
        public async Task<ActionResult<IEnumerable<SeriesDto>>> GetAllSeries()
        {
            var collection = await _context.Series
                .Select(s => new SeriesDto
                {
                    Id = s.Id,
                    Name = s.Name,
                    BrandName = s.Brand.Name,


                })
                .ToListAsync();

            return Ok(collection);
        }
    }
}
