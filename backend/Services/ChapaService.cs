using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using UniqueLow.Api.Data;
using UniqueLow.Api.DTOs;
using UniqueLow.Api.Models;

namespace UniqueLow.Api.Services;

public class ChapaService : IChapaService
{
    private readonly AppDbContext _context;
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly IConfiguration _configuration;
    private readonly ILogger<ChapaService> _logger;

    private const string ChapaBaseUrl = "https://api.chapa.global/v2";

    public ChapaService(
        AppDbContext context,
        IHttpClientFactory httpClientFactory,
        IConfiguration configuration,
        ILogger<ChapaService> logger)
    {
        _context = context;
        _httpClientFactory = httpClientFactory;
        _configuration = configuration;
        _logger = logger;
    }

    private string? GetSecretKey()
    {
        return _configuration["Chapa:SecretKey"]
            ?? _configuration["CHAPA_SECRET_KEY"]
            ?? Environment.GetEnvironmentVariable("CHAPA_SECRET_KEY");
    }

    public async Task<InitializePaymentResponseDto> InitializePaymentAsync(int userId, InitializePaymentDto dto)
    {
        var secretKey = GetSecretKey();
        if (string.IsNullOrWhiteSpace(secretKey))
        {
            return new InitializePaymentResponseDto
            {
                Success = false,
                Message = "Chapa Secret Key is not configured. Please add 'Chapa:SecretKey' to appsettings.json or environment variables."
            };
        }

        var user = await _context.Users.FindAsync(userId);
        if (user == null)
        {
            return new InitializePaymentResponseDto
            {
                Success = false,
                Message = "User not found."
            };
        }

        // Chapa v2 allows maximum 20 characters for merchant_reference
        var txRef = $"UL{DateTimeOffset.UtcNow.ToUnixTimeMilliseconds()}";

        // Amount in cents (minimum 100 cents = 1.00 ETB)
        long amountInCents = (long)Math.Round(dto.Amount * 100, 0);

        var requestPayload = new ChapaHostedPaymentRequest
        {
            AmountInCents = amountInCents,
            Currency = "ETB",
            MerchantReference = txRef,
            ReturnUrl = dto.ReturnUrl,
            Customer = new ChapaCustomerDto
            {
                FirstName = user.Username,
                Email = user.Email,
                PhoneNumber = !string.IsNullOrWhiteSpace(user.PhoneNumber) ? user.PhoneNumber : "0911000000"
            },
            Customization = new ChapaCustomizationDto
            {
                Title = "UniqueLow Wallet Top-Up",
                Description = $"Top up ${dto.Amount:F2} ETB into UniqueLow user account"
            }
        };

        try
        {
            var client = _httpClientFactory.CreateClient("ChapaClient");
            var request = new HttpRequestMessage(HttpMethod.Post, $"{ChapaBaseUrl}/payments/hosted");
            request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", secretKey.Trim());
            request.Headers.Add("Idempotency-Key", Guid.NewGuid().ToString());

            var jsonContent = JsonSerializer.Serialize(requestPayload);
            request.Content = new StringContent(jsonContent, Encoding.UTF8, "application/json");

            var response = await client.SendAsync(request);
            var responseBody = await response.Content.ReadAsStringAsync();

            _logger.LogInformation("Chapa hosted payment response: {Status} {Body}", response.StatusCode, responseBody);

            var chapaResult = JsonSerializer.Deserialize<ChapaHostedPaymentResponse>(responseBody, new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            });

            if (response.IsSuccessStatusCode && chapaResult != null &&
                string.Equals(chapaResult.Status, "success", StringComparison.OrdinalIgnoreCase) &&
                !string.IsNullOrWhiteSpace(chapaResult.Data?.CheckoutUrl))
            {
                // Record pending transaction in our database
                var paymentTx = new PaymentTransaction
                {
                    UserId = user.Id,
                    TxRef = txRef,
                    Amount = dto.Amount,
                    Currency = "ETB",
                    Status = "Pending",
                    PaymentMethod = "Chapa",
                    CreatedAt = DateTime.UtcNow
                };

                _context.PaymentTransactions.Add(paymentTx);
                await _context.SaveChangesAsync();

                return new InitializePaymentResponseDto
                {
                    Success = true,
                    Message = "Payment initiated successfully.",
                    CheckoutUrl = chapaResult.Data.CheckoutUrl,
                    TxRef = txRef
                };
            }

            return new InitializePaymentResponseDto
            {
                Success = false,
                Message = chapaResult?.Message ?? $"Failed to initialize Chapa payment: {response.StatusCode}"
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error initializing Chapa payment for user {UserId}", userId);
            return new InitializePaymentResponseDto
            {
                Success = false,
                Message = $"Payment initiation failed: {ex.Message}"
            };
        }
    }

    public async Task<VerifyPaymentResponseDto> VerifyPaymentAsync(string txRef)
    {
        var secretKey = GetSecretKey();
        if (string.IsNullOrWhiteSpace(secretKey))
        {
            return new VerifyPaymentResponseDto
            {
                Success = false,
                Message = "Chapa Secret Key is not configured."
            };
        }

        var cleanTxRef = txRef.Trim();
        var transaction = await _context.PaymentTransactions
            .Include(t => t.User)
            .FirstOrDefaultAsync(t => t.TxRef == cleanTxRef);

        if (transaction == null)
        {
            return new VerifyPaymentResponseDto
            {
                Success = false,
                Message = $"Transaction '{cleanTxRef}' not found in platform records."
            };
        }

        // Idempotency: if already completed and credited, return success immediately
        if (string.Equals(transaction.Status, "Success", StringComparison.OrdinalIgnoreCase))
        {
            return new VerifyPaymentResponseDto
            {
                Success = true,
                Message = "Payment has already been verified and credited.",
                Amount = transaction.Amount,
                NewBalance = transaction.User?.Balance ?? 0,
                TxRef = transaction.TxRef,
                Status = "Success"
            };
        }

        try
        {
            var client = _httpClientFactory.CreateClient("ChapaClient");
            var request = new HttpRequestMessage(HttpMethod.Get, $"{ChapaBaseUrl}/payments/{cleanTxRef}/verify");
            request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", secretKey.Trim());

            var response = await client.SendAsync(request);
            var responseBody = await response.Content.ReadAsStringAsync();

            _logger.LogInformation("Chapa verify response: {Status} {Body}", response.StatusCode, responseBody);

            var verifyResult = JsonSerializer.Deserialize<ChapaVerifyResponse>(responseBody, new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            });

            var isVerified = response.IsSuccessStatusCode &&
                verifyResult != null &&
                string.Equals(verifyResult.Status, "success", StringComparison.OrdinalIgnoreCase) &&
                string.Equals(verifyResult.Data?.Status, "SUCCESS", StringComparison.OrdinalIgnoreCase);

            if (isVerified)
            {
                // Credit user balance
                if (transaction.User != null)
                {
                    transaction.User.Balance += transaction.Amount;
                }

                transaction.Status = "Success";
                transaction.CompletedAt = DateTime.UtcNow;
                transaction.ChapaReference = verifyResult?.Data?.ChapaReference;
                if (!string.IsNullOrWhiteSpace(verifyResult?.Data?.PaymentMethod))
                {
                    transaction.PaymentMethod = verifyResult.Data.PaymentMethod;
                }

                await _context.SaveChangesAsync();

                return new VerifyPaymentResponseDto
                {
                    Success = true,
                    Message = $"Successfully credited ${transaction.Amount:F2} ETB to your wallet!",
                    Amount = transaction.Amount,
                    NewBalance = transaction.User?.Balance ?? 0,
                    TxRef = transaction.TxRef,
                    Status = "Success"
                };
            }

            // If Chapa indicates payment is still pending or failed
            var currentStatus = verifyResult?.Data?.Status ?? "Failed";
            if (!string.Equals(currentStatus, "PENDING", StringComparison.OrdinalIgnoreCase))
            {
                transaction.Status = "Failed";
                transaction.ErrorMessage = verifyResult?.Message ?? "Payment was not completed.";
                await _context.SaveChangesAsync();
            }

            return new VerifyPaymentResponseDto
            {
                Success = false,
                Message = verifyResult?.Message ?? $"Payment verification failed (Status: {currentStatus})",
                Amount = transaction.Amount,
                NewBalance = transaction.User?.Balance ?? 0,
                TxRef = transaction.TxRef,
                Status = currentStatus
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error verifying Chapa payment for {TxRef}", cleanTxRef);
            return new VerifyPaymentResponseDto
            {
                Success = false,
                Message = $"Verification error: {ex.Message}",
                TxRef = cleanTxRef
            };
        }
    }
}

