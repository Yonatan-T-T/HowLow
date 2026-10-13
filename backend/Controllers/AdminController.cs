using Microsoft.AspNetCore.Mvc;
using UniqueLow.Api.DTOs;
using UniqueLow.Api.Services;

namespace UniqueLow.Api.Controllers;

[ApiController]
[Route("api/admin")]
public class AdminController : ControllerBase
{
    private readonly IAuctionService _auctionService;
    private readonly ILogger<AdminController> _logger;

    public AdminController(IAuctionService auctionService, ILogger<AdminController> logger)
    {
        _auctionService = auctionService;
        _logger = logger;
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
