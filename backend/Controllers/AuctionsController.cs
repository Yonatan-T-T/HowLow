using Microsoft.AspNetCore.Mvc;
using UniqueLow.Api.DTOs;
using UniqueLow.Api.Services;

namespace UniqueLow.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuctionsController : ControllerBase
{
    private readonly IAuctionService _auctionService;
    private readonly ILogger<AuctionsController> _logger;

    public AuctionsController(IAuctionService auctionService, ILogger<AuctionsController> logger)
    {
        _auctionService = auctionService;
        _logger = logger;
    }

    private int? GetCurrentUserId()
    {
        if (Request.Headers.TryGetValue("X-User-Id", out var userIdHeader) && 
            int.TryParse(userIdHeader, out var userId))
        {
            return userId;
        }
        return null;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<AuctionItemDto>>> GetAuctions([FromQuery] string? status)
    {
        var userId = GetCurrentUserId();
        var auctions = await _auctionService.GetAuctionsAsync(userId, status);
        return Ok(auctions);
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<AuctionItemDto>> GetAuctionById(int id)
    {
        var userId = GetCurrentUserId();
        var auction = await _auctionService.GetAuctionByIdAsync(id, userId);
        if (auction == null)
            return NotFound(new { message = $"Auction #{id} was not found." });

        return Ok(auction);
    }

    [HttpPost("{id:int}/register")]
    public async Task<IActionResult> RegisterForAuction(int id, [FromBody] RegisterAuctionDto? dto)
    {
        int? userId = dto?.UserId ?? GetCurrentUserId();
        if (!userId.HasValue || userId.Value <= 0)
        {
            return BadRequest(new { message = "Valid UserId is required to register." });
        }

        var (success, message, newBalance) = await _auctionService.RegisterUserAsync(id, userId.Value);
        if (!success)
        {
            return BadRequest(new { message, balance = newBalance });
        }

        return Ok(new { success = true, message, balance = newBalance });
    }

    [HttpPost("{id:int}/bid")]
    public async Task<IActionResult> PlaceBid(int id, [FromBody] PlaceBidDto dto)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        int userId = dto.UserId > 0 ? dto.UserId : (GetCurrentUserId() ?? 0);
        if (userId <= 0)
        {
            return BadRequest(new { message = "Valid UserId is required to place a bid." });
        }

        var (success, message, bid) = await _auctionService.PlaceBidAsync(id, userId, dto.Amount);
        if (!success)
        {
            return BadRequest(new { message });
        }

        return Ok(new
        {
            success = true,
            message,
            bidId = bid?.Id,
            amount = bid?.Amount,
            placedAt = bid?.PlacedAt
        });
    }

    [HttpPost("{id:int}/resolve")]
    public async Task<ActionResult<ResolveAuctionResultDto>> ResolveAuction(int id)
    {
        try
        {
            var result = await _auctionService.ResolveLowestUniqueBidAsync(id);
            return Ok(result);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error resolving auction {AuctionId}", id);
            return StatusCode(500, new { message = "An error occurred while resolving the auction." });
        }
    }

    [HttpGet("{id:int}/bids/me")]
    public async Task<ActionResult<IEnumerable<BidDto>>> GetMyBids(int id, [FromQuery] int? userId)
    {
        int effectiveUserId = userId ?? GetCurrentUserId() ?? 0;
        if (effectiveUserId <= 0)
        {
            return BadRequest(new { message = "UserId is required to fetch personal bids." });
        }

        var bids = await _auctionService.GetUserBidsForAuctionAsync(id, effectiveUserId);
        return Ok(bids);
    }
}
