using Microsoft.AspNetCore.Mvc;
using UniqueLow.Api.DTOs;
using UniqueLow.Api.Services;

namespace UniqueLow.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;

    public AuthController(IAuthService authService)
    {
        _authService = authService;
    }

    private int? GetCurrentUserId()
    {
        if (Request.Headers.TryGetValue("X-User-Id", out var userIdHeader) &&
            int.TryParse(userIdHeader, out var userId))
        {
            return userId;
        }

        // Also check Authorization header if present
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

    [HttpPost("register")]
    public async Task<ActionResult<AuthResponseDto>> Register([FromBody] RegisterRequestDto dto)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(new AuthResponseDto
            {
                Success = false,
                Message = string.Join("; ", ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage))
            });
        }

        var result = await _authService.RegisterAsync(dto);
        if (!result.Success)
        {
            return BadRequest(result);
        }

        return Ok(result);
    }

    [HttpPost("login")]
    public async Task<ActionResult<AuthResponseDto>> Login([FromBody] LoginRequestDto dto)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(new AuthResponseDto
            {
                Success = false,
                Message = string.Join("; ", ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage))
            });
        }

        var result = await _authService.LoginAsync(dto);
        if (!result.Success)
        {
            return Unauthorized(result);
        }

        return Ok(result);
    }

    [HttpGet("me")]
    public async Task<ActionResult<UserDto>> GetMe()
    {
        var userId = GetCurrentUserId();
        if (!userId.HasValue || userId.Value <= 0)
        {
            return Unauthorized(new { message = "You are not logged in." });
        }

        var user = await _authService.GetUserByIdAsync(userId.Value);
        if (user == null)
        {
            return NotFound(new { message = "User not found." });
        }

        return Ok(user);
    }

    [HttpGet("test-profiles")]
    public ActionResult<IEnumerable<TestProfileDto>> GetTestProfiles()
    {
        var profiles = _authService.GetTestProfiles();
        return Ok(profiles);
    }
}
