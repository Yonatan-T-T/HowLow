using Microsoft.AspNetCore.Mvc;
using UniqueLow.Api.DTOs;
using UniqueLow.Api.Services;

namespace UniqueLow.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PaymentController : ControllerBase
{
    private readonly IChapaService _chapaService;
    private readonly ILogger<PaymentController> _logger;

    public PaymentController(IChapaService chapaService, ILogger<PaymentController> logger)
    {
        _chapaService = chapaService;
        _logger = logger;
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

    [HttpPost("chapa/initialize")]
    public async Task<ActionResult<InitializePaymentResponseDto>> InitializeChapaPayment([FromBody] InitializePaymentDto dto)
    {
        var userId = GetCurrentUserId();
        if (!userId.HasValue || userId.Value <= 0)
        {
            return Unauthorized(new InitializePaymentResponseDto
            {
                Success = false,
                Message = "You must be logged in to top up your wallet."
            });
        }

        if (!ModelState.IsValid)
        {
            return BadRequest(new InitializePaymentResponseDto
            {
                Success = false,
                Message = string.Join("; ", ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage))
            });
        }

        var result = await _chapaService.InitializePaymentAsync(userId.Value, dto);
        if (!result.Success)
        {
            return BadRequest(result);
        }

        return Ok(result);
    }

    [HttpGet("chapa/verify/{txRef}")]
    public async Task<ActionResult<VerifyPaymentResponseDto>> VerifyChapaPayment(string txRef)
    {
        if (string.IsNullOrWhiteSpace(txRef))
        {
            return BadRequest(new VerifyPaymentResponseDto
            {
                Success = false,
                Message = "Transaction reference is required."
            });
        }

        var result = await _chapaService.VerifyPaymentAsync(txRef);
        if (!result.Success)
        {
            return BadRequest(result);
        }

        return Ok(result);
    }

    [HttpPost("chapa/sync")]
    public async Task<ActionResult<SyncPaymentsResponseDto>> SyncMyPendingPayments()
    {
        var userId = GetCurrentUserId();
        if (!userId.HasValue || userId.Value <= 0)
        {
            return Unauthorized(new SyncPaymentsResponseDto
            {
                Success = false,
                Message = "User authentication required."
            });
        }

        var result = await _chapaService.SyncUserPendingPaymentsAsync(userId.Value);
        return Ok(result);
    }

    [HttpPost("chapa/webhook")]
    public async Task<IActionResult> ChapaWebhook([FromBody] System.Text.Json.JsonElement payload)
    {
        try
        {
            _logger.LogInformation("Received Chapa Webhook: {Payload}", payload.ToString());

            string? txRef = null;
            if (payload.TryGetProperty("data", out var dataElem))
            {
                if (dataElem.TryGetProperty("tx_ref", out var txProp))
                    txRef = txProp.GetString();
                else if (dataElem.TryGetProperty("merchant_reference", out var mrProp))
                    txRef = mrProp.GetString();
                else if (dataElem.TryGetProperty("reference", out var refProp))
                    txRef = refProp.GetString();
            }

            if (string.IsNullOrWhiteSpace(txRef))
            {
                if (payload.TryGetProperty("tx_ref", out var flatTx))
                    txRef = flatTx.GetString();
                else if (payload.TryGetProperty("trx_ref", out var flatTrx))
                    txRef = flatTrx.GetString();
            }

            if (!string.IsNullOrWhiteSpace(txRef))
            {
                var verifyResult = await _chapaService.VerifyPaymentAsync(txRef);
                _logger.LogInformation("Webhook auto-verification result for {TxRef}: {Success} {Message}",
                    txRef, verifyResult.Success, verifyResult.Message);
            }

            return Ok(new { received = true });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error processing Chapa webhook");
            return Ok(new { received = true });
        }
    }
}

