using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PuzzleTracker.Server.Data;
using PuzzleTracker.Server.Data.DTOs;

namespace PuzzleTracker.Server.Controllers
{
    public class AccountController : Controller
    {
        private readonly UserManager<IdentityUser> _userManager;
        private readonly PuzzleTrackerContext _context;

        public AccountController(UserManager<IdentityUser> userManager, PuzzleTrackerContext context)
        {
            _userManager = userManager;
            _context = context;
        }
        [Authorize]
        [HttpGet("profile")]
        public async Task<ActionResult<UserProfileDto>> GetCurrentUserProfile()
        {
            var userId = _userManager.GetUserId(User);

            var userProfile = await _context.Users
                .Where(u => u.Id == userId)
                .Select(u => new UserProfileDto
                {
                    Id = u.Id,
                    Name = u.UserName,
                    Email = u.Email,
                    TotalPuzzlesOwned = u.UserPuzzles.Count(up => up.IsOwned),
                    TotalPuzzlesCompleted = u.UserPuzzles.Count(up => up.IsCompleted),
                    DisplayName = u.DisplayName,
                    ProfilePicUrl = u.ProfilePicUrl,
                    Bio = u.Bio
                })
                .FirstOrDefaultAsync();

            if (userProfile == null)
            {
                return NotFound();
            }

            return Ok(userProfile);
        }
    }
}
