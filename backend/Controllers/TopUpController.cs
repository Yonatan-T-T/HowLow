using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using UniqueLow.Api.Data;
using UniqueLow.Api.DTOs;
using UniqueLow.Api.Models;

namespace UniqueLow.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TopUpController : ControllerBase
{
    private readonly AppDbContext _context;

    // List of system merchant / agent receiver accounts (including the one from the user's reference)
    private static readonly List<AgentAccountDto> AgentAccounts = new()
    {
        new AgentAccountDto
        {
            ReceiverPhoneNumber = "0942618861",
            ReceiverName = "Tekleweyni alemayehu brhane"
        },
        new AgentAccountDto
        {
            ReceiverPhoneNumber = "0911783420",
            ReceiverName = "Abebech Tadesse Mengesha"
        },
        new AgentAccountDto
        {
            ReceiverPhoneNumber = "0923541189",
            ReceiverName = "Yohannes Hailemariam Wolde"
        },
        new AgentAccountDto
        {
            ReceiverPhoneNumber = "0930119283",
            ReceiverName = "Bethlehem Assefa Girma"
        }
    };

    public TopUpController(AppDbContext context)
    {
        _context = context;
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
                    // Invalid token
                }
            }
        }

        return null;
    }

    /// <summary>
    /// Generates/picks a random receiver account for Telebirr deposit
    /// </summary>
    [HttpGet("agent-account")]
    public ActionResult<AgentAccountDto> GetRandomAgentAccount()
    {
        var random = new Random();
        var selected = AgentAccounts[random.Next(AgentAccounts.Count)];
        return Ok(selected);
    }

    /// <summary>
    /// Submit a Telebirr top-up deposit request with transaction number
    /// </summary>
    [HttpPost("request")]
    public async Task<ActionResult<TopUpRequestDto>> SubmitTopUpRequest([FromBody] CreateTopUpRequestDto dto)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var userId = GetCurrentUserId();
        if (!userId.HasValue || userId.Value <= 0)
        {
            return Unauthorized(new { message = "You must be logged in to request a wallet top-up." });
        }

        var user = await _context.Users.FindAsync(userId.Value);
        if (user == null)
        {
            return NotFound(new { message = "User account not found." });
        }

        var senderPhone = string.IsNullOrWhiteSpace(dto.SenderPhoneNumber)
            ? user.PhoneNumber
            : dto.SenderPhoneNumber.Trim();

        var request = new TopUpRequest
        {
            UserId = user.Id,
            SenderPhoneNumber = senderPhone,
            ReceiverPhoneNumber = dto.ReceiverPhoneNumber.Trim(),
            ReceiverName = dto.ReceiverName.Trim(),
            Amount = Math.Round(dto.Amount, 2),
            TransactionNumber = dto.TransactionNumber.Trim().ToUpperInvariant(),
            Status = "Pending",
            CreatedAt = DateTime.UtcNow
        };

        _context.TopUpRequests.Add(request);
        await _context.SaveChangesAsync();

        return Ok(new TopUpRequestDto
        {
            Id = request.Id,
            UserId = user.Id,
            Username = user.Username,
            UserEmail = user.Email,
            SenderPhoneNumber = request.SenderPhoneNumber,
            ReceiverPhoneNumber = request.ReceiverPhoneNumber,
            ReceiverName = request.ReceiverName,
            Amount = request.Amount,
            TransactionNumber = request.TransactionNumber,
            Status = request.Status,
            CreatedAt = request.CreatedAt
        });
    }

    /// <summary>
    /// Get the current user's top-up request history
    /// </summary>
    [HttpGet("my-requests")]
    public async Task<ActionResult<IEnumerable<TopUpRequestDto>>> GetMyRequests()
    {
        var userId = GetCurrentUserId();
        if (!userId.HasValue || userId.Value <= 0)
        {
            return Unauthorized(new { message = "You must be logged in." });
        }

        var list = await _context.TopUpRequests
            .Include(t => t.User)
            .Where(t => t.UserId == userId.Value)
            .OrderByDescending(t => t.CreatedAt)
            .Select(t => new TopUpRequestDto
            {
                Id = t.Id,
                UserId = t.UserId,
                Username = t.User != null ? t.User.Username : string.Empty,
                UserEmail = t.User != null ? t.User.Email : string.Empty,
                SenderPhoneNumber = t.SenderPhoneNumber,
                ReceiverPhoneNumber = t.ReceiverPhoneNumber,
                ReceiverName = t.ReceiverName,
                Amount = t.Amount,
                TransactionNumber = t.TransactionNumber,
                Status = t.Status,
                CreatedAt = t.CreatedAt,
                ReviewedAt = t.ReviewedAt,
                ReviewedBy = t.ReviewedBy,
                AdminNotes = t.AdminNotes
            })
            .ToListAsync();

        return Ok(list);
    }

    /// <summary>
    /// Admin: List all top-up requests
    /// </summary>
    [HttpGet("admin/all")]
    public async Task<ActionResult<IEnumerable<TopUpRequestDto>>> GetAllRequestsAdmin()
    {
        var list = await _context.TopUpRequests
            .Include(t => t.User)
            .OrderByDescending(t => t.CreatedAt)
            .Select(t => new TopUpRequestDto
            {
                Id = t.Id,
                UserId = t.UserId,
                Username = t.User != null ? t.User.Username : string.Empty,
                UserEmail = t.User != null ? t.User.Email : string.Empty,
                SenderPhoneNumber = t.SenderPhoneNumber,
                ReceiverPhoneNumber = t.ReceiverPhoneNumber,
                ReceiverName = t.ReceiverName,
                Amount = t.Amount,
                TransactionNumber = t.TransactionNumber,
                Status = t.Status,
                CreatedAt = t.CreatedAt,
                ReviewedAt = t.ReviewedAt,
                ReviewedBy = t.ReviewedBy,
                AdminNotes = t.AdminNotes
            })
            .ToListAsync();

        return Ok(list);
    }

    /// <summary>
    /// Admin: Approve a top-up request and credit the user's wallet balance
    /// </summary>
    [HttpPost("admin/{id:int}/approve")]
    public async Task<IActionResult> ApproveRequest(int id)
    {
        var request = await _context.TopUpRequests
            .Include(t => t.User)
            .FirstOrDefaultAsync(t => t.Id == id);

        if (request == null)
        {
            return NotFound(new { message = $"Top-up request #{id} not found." });
        }

        if (request.Status == "Approved")
        {
            return BadRequest(new { message = "This request has already been approved." });
        }

        if (request.User == null)
        {
            return BadRequest(new { message = "User associated with this request no longer exists." });
        }

        // Credit balance
        request.User.Balance += request.Amount;
        request.Status = "Approved";
        request.ReviewedAt = DateTime.UtcNow;
        request.ReviewedBy = "Admin";

        await _context.SaveChangesAsync();

        return Ok(new
        {
            success = true,
            message = $"Top-up of {request.Amount:F2} ETB approved for {request.User.Username}. New balance: {request.User.Balance:F2}",
            newBalance = request.User.Balance,
            requestId = request.Id
        });
    }

    /// <summary>
    /// Admin: Reject a top-up request
    /// </summary>
    [HttpPost("admin/{id:int}/reject")]
    public async Task<IActionResult> RejectRequest(int id, [FromBody] RejectTopUpDto? dto)
    {
        var request = await _context.TopUpRequests
            .Include(t => t.User)
            .FirstOrDefaultAsync(t => t.Id == id);

        if (request == null)
        {
            return NotFound(new { message = $"Top-up request #{id} not found." });
        }

        if (request.Status == "Approved")
        {
            return BadRequest(new { message = "Cannot reject a request that has already been approved." });
        }

        request.Status = "Rejected";
        request.ReviewedAt = DateTime.UtcNow;
        request.ReviewedBy = "Admin";
        request.AdminNotes = dto?.Reason ?? "Transaction could not be verified on Telebirr.";

        await _context.SaveChangesAsync();

        return Ok(new
        {
            success = true,
            message = $"Top-up request #{id} was rejected.",
            requestId = request.Id
        });
    }
}
