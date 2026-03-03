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
    public class IllustratorController : ControllerBase
    {
        private readonly PuzzleTrackerContext _context;

        public IllustratorController(PuzzleTrackerContext context)
        {
            _context = context;
        }

        [HttpGet("illustrators")]
        public async Task<ActionResult<IEnumerable<IllustratorDto>>> GetAllIllustrators()
        {
            var collection = await _context.Illustrators
                .Select(i => new IllustratorDto
                {
                    Id = i.Id,
                    Name = i.Name,
                })
                .ToListAsync();

            return Ok(collection);
        }
    }
}
