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
    [Route("api/account")]
    [ApiController]
    [EnableCors("AllowClient")]
    public class AccountController : ControllerBase
    {
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly SignInManager<ApplicationUser> _signInManager;
        private readonly PuzzleTrackerContext _context;

        public AccountController(UserManager<ApplicationUser> userManager, SignInManager<ApplicationUser> signInManager, PuzzleTrackerContext context)
        {
            _userManager = userManager;
            _signInManager = signInManager;
            _context = context;
        }
        [HttpGet("profile")]
        public async Task<ActionResult<UserProfileDto>> GetCurrentUserProfile()
        {
            var userId = _userManager.GetUserId(User);

            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized(new { error = "Unauthorized" });
            }

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

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDto loginDto)
        {
            try
            {
                if (string.IsNullOrEmpty(loginDto.Email) || string.IsNullOrEmpty(loginDto.Password))
                {
                    return BadRequest(new { message = "Email and password are required" });
                }

                var user = await _userManager.FindByEmailAsync(loginDto.Email);
                if (user == null)
                {
                    return Unauthorized(new { message = "Invalid email or password" });
                }

                var result = await _signInManager.PasswordSignInAsync(user, loginDto.Password, isPersistent: true, lockoutOnFailure: false);

                if (result.Succeeded)
                {
                    return Ok(new { message = "Login successful" });
                }

                if (result.IsLockedOut)
                {
                    return Unauthorized(new { message = "Account is locked" });
                }

                if (result.IsNotAllowed)
                {
                    return Unauthorized(new { message = "Login not allowed" });
                }

                return Unauthorized(new { message = "Invalid email or password" });
            }
            catch (Exception ex)
            {
                // Log the exception here if you have logging configured
                return StatusCode(500, new { message = "An error occurred during login", error = ex.Message });
            }
        }

        [HttpPost("logout")]
        [Authorize]
        public async Task<IActionResult> Logout()
        {
            await _signInManager.SignOutAsync();
            return Ok(new { message = "Logout successful" });
        }
    }
}
