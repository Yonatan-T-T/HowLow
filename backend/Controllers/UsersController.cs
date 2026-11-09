using Microsoft.AspNetCore.Mvc;
using UniqueLow.Api.DTOs;
using UniqueLow.Api.Services;

namespace UniqueLow.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class UsersController : ControllerBase
{
    private readonly IUserService _userService;

    public UsersController(IUserService userService)
    {
        _userService = userService;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<UserDto>>> GetAllUsers()
    {
        var users = await _userService.GetAllUsersAsync();
        return Ok(users);
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<UserDto>> GetUser(int id)
    {
        var user = await _userService.GetUserByIdAsync(id);
        if (user == null)
            return NotFound(new { message = $"User #{id} was not found." });

        return Ok(user);
    }

    [HttpPost("{id:int}/deposit")]
    public async Task<IActionResult> Deposit(int id, [FromBody] WalletDepositDto dto)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var (success, message, newBalance) = await _userService.DepositFundsAsync(id, dto.Amount);
        if (!success)
            return BadRequest(new { message });

        return Ok(new { success = true, message, balance = newBalance });
    }

    [HttpPut("profile")]
    public async Task<ActionResult<UpdateProfileResponseDto>> UpdateProfile([FromBody] UpdateProfileDto dto)
    {
        var currentUserId = GetCurrentUserId();
        if (!currentUserId.HasValue || currentUserId.Value <= 0)
        {
            return Unauthorized(new UpdateProfileResponseDto
            {
                Success = false,
                Message = "You must be logged in to update your profile."
            });
        }

        if (!ModelState.IsValid)
        {
            return BadRequest(new UpdateProfileResponseDto
            {
                Success = false,
                Message = string.Join("; ", ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage))
            });
        }

        var result = await _userService.UpdateProfileAsync(currentUserId.Value, dto);
        if (!result.Success)
        {
            return BadRequest(result);
        }

        return Ok(result);
    }

    private int? GetCurrentUserId()
    {
        if (Request.Headers.TryGetValue("X-User-Id", out var userIdHeader) &&
            int.TryParse(userIdHeader, out var userId))
        {
            return userId;
        }

        if (Request.Headers.TryGetValue("Authorization", out var authHeader))
        {
            var headerStr = authHeader.ToString();
            if (headerStr.StartsWith("Bearer ", StringComparison.OrdinalIgnoreCase))
            {
                var token = headerStr.Substring(7).Trim();
                try
                {
                    var decoded = System.Text.Encoding.UTF8.GetString(Convert.FromBase64String(token));
                    var parts = decoded.Split(':');
                    if (parts.Length > 0 && int.TryParse(parts[0], out var tokenUserId))
                    {
                        return tokenUserId;
                    }
                }
                catch
                {
                    // Invalid token format
                }
            }
        }

        return null;
    }
}
