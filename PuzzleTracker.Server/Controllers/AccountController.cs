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
        [Authorize]
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
                    TotalPuzzlesInCollection = u.UserPuzzles.Count(),
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

        [Authorize]
        [HttpPut("profile/update")]
        public async Task<IActionResult> UpdateUserProfile([FromBody] UpdateUserProfileDto updateDto)
        {
            var userId = _userManager.GetUserId(User);
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized(new { error = "Unauthorized" });
            }
            var user = await _userManager.FindByIdAsync(userId);
            if (user == null)
            {
                return NotFound();
            }
            user.DisplayName = updateDto.DisplayName;
            user.ProfilePicUrl = updateDto.ProfilePicUrl;
            user.Bio = updateDto.Bio;
            var result = await _userManager.UpdateAsync(user);
            if (result.Succeeded)
            {
                return Ok(new { message = "Profile updated successfully" });
            }
            return BadRequest(new { message = "Failed to update profile", errors = result.Errors.Select(e => e.Description) });
        }

        public class ChangePasswordDto
        {
            public string CurrentPassword { get; set; }
            public string NewPassword { get; set; }
            public string NewPasswordConfirm { get; set; }
        }

        [Authorize]
        [HttpPut("change-password")]
        public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordDto changePasswordDto)
        {
            var userId = _userManager.GetUserId(User);
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized(new { error = "Unauthorized" });
            }
            var user = await _userManager.FindByIdAsync(userId);
            if (user == null)
            {
                return NotFound();
            }
            if (changePasswordDto.NewPassword != changePasswordDto.NewPasswordConfirm)
            {
                return BadRequest(new { message = "New passwords do not match" });
            }
            var result = await _userManager.ChangePasswordAsync(user, changePasswordDto.CurrentPassword, changePasswordDto.NewPassword);
            if (result.Succeeded)
            {
                return Ok(new { message = "Password changed successfully" });
            }
            return BadRequest(new { message = "Failed to change password", errors = result.Errors.Select(e => e.Description) });
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

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterDto registerDto)
        {
            try
            {
                if (string.IsNullOrEmpty(registerDto.Email) || string.IsNullOrEmpty(registerDto.Password))
                {
                    return BadRequest(new { message = "Email and password are required" });
                }

                if (registerDto.Password != registerDto.ConfirmPassword)
                {
                    return BadRequest(new { message = "Passwords do not match" });
                }

                var existingUser = await _userManager.FindByEmailAsync(registerDto.Email);
                if (existingUser != null)
                {
                    return BadRequest(new { message = "Email is already registered" });
                }

                var user = new ApplicationUser
                {
                    UserName = registerDto.Email,
                    Email = registerDto.Email,
                    DisplayName = registerDto.DisplayName
                };

                var result = await _userManager.CreateAsync(user, registerDto.Password);

                if (result.Succeeded)
                {
                    await _signInManager.SignInAsync(user, isPersistent: true);
                    return Ok(new { message = "Registration successful" });
                }

                return BadRequest(new { message = "Registration failed", errors = result.Errors.Select(e => e.Description) });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred during registration", error = ex.Message });
            }
        }


    }
}
