using Microsoft.AspNetCore.Mvc;
using UniqueLow.Api.DTOs;
using UniqueLow.Api.Services;

namespace UniqueLow.Api.Controllers;

[ApiController]
[Route("api/admin")]
public class AdminController : ControllerBase
{
    private readonly IAuctionService _auctionService;
    private readonly IAuthService _authService;
    private readonly ILogger<AdminController> _logger;

    public AdminController(IAuctionService auctionService, IAuthService authService, ILogger<AdminController> logger)
    {
        _auctionService = auctionService;
        _authService = authService;
        _logger = logger;
    }

    [HttpPost("create-admin")]
    public async Task<ActionResult<AuthResponseDto>> CreateAdmin([FromBody] RegisterRequestDto dto)
    {
        var callerAdminId = GetCurrentUserId();
        if (!callerAdminId.HasValue || callerAdminId.Value <= 0)
        {
            return Unauthorized(new AuthResponseDto
            {
                Success = false,
                Message = "Authentication required. Please log in as an administrator."
            });
        }

        if (!ModelState.IsValid)
        {
            return BadRequest(new AuthResponseDto
            {
                Success = false,
                Message = string.Join("; ", ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage))
            });
        }

        var result = await _authService.CreateAdminAsync(dto, callerAdminId.Value);
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

    [HttpPost("items")]
    public async Task<ActionResult<AuctionItemDto>> CreateAuctionItem([FromBody] CreateAuctionDto dto)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        if (dto.EndTime <= DateTime.UtcNow)
        {
            return BadRequest(new { message = "Auction EndTime must be set in the future." });
        }

        var created = await _auctionService.CreateAuctionAsync(dto);
        return CreatedAtAction(nameof(AuctionsController.GetAuctionById), "Auctions", new { id = created.Id }, created);
    }

    [HttpGet("auctions/{id:int}/analytics")]
    public async Task<ActionResult<AuctionAnalyticsDto>> GetAuctionAnalytics(int id)
    {
        var analytics = await _auctionService.GetAuctionAnalyticsAsync(id);
        if (analytics == null)
            return NotFound(new { message = $"Auction #{id} was not found." });

        return Ok(analytics);
    }

    [HttpPost("auctions/{id:int}/cancel")]
    public async Task<IActionResult> CancelAuction(int id)
    {
        var result = await _auctionService.CancelAuctionAsync(id);
        if (!result)
            return NotFound(new { message = $"Auction #{id} not found." });

        return Ok(new { message = $"Auction #{id} was successfully cancelled." });
    }

    [HttpGet("pending-items")]
    public async Task<ActionResult<IEnumerable<AuctionItemDto>>> GetPendingItems()
    {
        var items = await _auctionService.GetPendingApprovalAuctionsAsync();
        return Ok(items);
    }

    [HttpPost("items/{id:int}/approve")]
    public async Task<IActionResult> ApproveItem(int id)
    {
        string adminUsername = Request.Headers.TryGetValue("X-Admin-Username", out var val) ? val.ToString() : "Admin";
        var (success, message, item) = await _auctionService.ApproveAuctionAsync(id, adminUsername);
        if (!success)
            return BadRequest(new { message });

        return Ok(new { success = true, message, item });
    }

    [HttpPost("items/{id:int}/reject")]
    public async Task<IActionResult> RejectItem(int id, [FromBody] RejectAuctionDto? dto)
    {
        string adminUsername = Request.Headers.TryGetValue("X-Admin-Username", out var val) ? val.ToString() : "Admin";
        string reason = dto?.Reason ?? "Did not meet platform listing guidelines.";
        bool refund = dto?.RefundFee ?? true;

        var (success, message) = await _auctionService.RejectAuctionAsync(id, adminUsername, reason, refund);
        if (!success)
            return BadRequest(new { message });

        return Ok(new { success = true, message });
    }

    [HttpPost("items/{id:int}/cancel-fraud")]
    public async Task<IActionResult> CancelForFraud(int id, [FromBody] CancelFraudAuctionDto? dto)
    {
        string adminUsername = Request.Headers.TryGetValue("X-Admin-Username", out var val) ? val.ToString() : "Admin";
        string reason = dto?.Reason ?? "Item verified as counterfeit or not in brand new condition. Listing fee forfeited.";

        var (success, message) = await _auctionService.CancelAuctionForFraudAsync(id, adminUsername, reason);
        if (!success)
            return BadRequest(new { message });

        return Ok(new { success = true, message });
    }
}
