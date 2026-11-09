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
        var key = _configuration["Chapa:SecretKey"]
            ?? _configuration["Chapa__SecretKey"]
            ?? _configuration["CHAPA_SECRET_KEY"]
            ?? Environment.GetEnvironmentVariable("Chapa__SecretKey")
            ?? Environment.GetEnvironmentVariable("CHAPA_SECRET_KEY");

        return string.IsNullOrWhiteSpace(key) ? null : key.Trim();
    }

    private static string FormatPhoneForChapa(string? phone)
    {
        if (string.IsNullOrWhiteSpace(phone)) return "+251911000000";
        var clean = phone.Trim().Replace(" ", "").Replace("-", "");
        if (clean.StartsWith("+")) return clean;
        if (clean.StartsWith("0")) return "+251" + clean.Substring(1);
        if (clean.StartsWith("251")) return "+" + clean;
        return "+251" + clean;
    }

    public async Task<InitializePaymentResponseDto> InitializePaymentAsync(int userId, InitializePaymentDto dto)
    {
        var secretKey = GetSecretKey();
        if (string.IsNullOrWhiteSpace(secretKey))
        {
            return new InitializePaymentResponseDto
            {
                Success = false,
                Message = "Chapa Secret Key is not configured. Please add 'Chapa:SecretKey' to appsettings.json or 'Chapa__SecretKey' to Render environment variables."
            };
        }

        // Catch if user accidentally copied the Public Key instead of Private Key
        if (secretKey.Contains("_PUB_", StringComparison.OrdinalIgnoreCase) || 
            secretKey.StartsWith("CHAPUBK", StringComparison.OrdinalIgnoreCase))
        {
            return new InitializePaymentResponseDto
            {
                Success = false,
                Message = "Invalid Key: You configured a Public Key. Please copy your 'Private Key' from the Chapa Dashboard instead."
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

        // Chapa v2 requires return_url to be a valid HTTPS URL. If testing on localhost (http), omit it
        string? safeReturnUrl = null;
        if (!string.IsNullOrWhiteSpace(dto.ReturnUrl) && dto.ReturnUrl.StartsWith("https://", StringComparison.OrdinalIgnoreCase))
        {
            safeReturnUrl = dto.ReturnUrl;
        }

        var requestPayload = new ChapaHostedPaymentRequest
        {
            AmountInCents = amountInCents,
            Currency = "ETB",
            MerchantReference = txRef,
            ReturnUrl = safeReturnUrl,
            Customer = new ChapaCustomerDto
            {
                FirstName = user.Username,
                Email = user.Email,
                PhoneNumber = FormatPhoneForChapa(user.PhoneNumber)
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
            request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", secretKey);
            request.Headers.Add("Idempotency-Key", Guid.NewGuid().ToString());

            var jsonOptions = new JsonSerializerOptions
            {
                DefaultIgnoreCondition = System.Text.Json.Serialization.JsonIgnoreCondition.WhenWritingNull
            };
            var jsonContent = JsonSerializer.Serialize(requestPayload, jsonOptions);
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

                try
                {
                    _context.PaymentTransactions.Add(paymentTx);
                    await _context.SaveChangesAsync();
                }
                catch (Exception dbEx)
                {
                    _logger.LogWarning(dbEx, "Initial save of PaymentTransaction failed, attempting schema auto-repair");
                    try
                    {
                        if (!_context.Database.IsSqlite())
                        {
                            await _context.Database.ExecuteSqlRawAsync(@"
                                CREATE TABLE IF NOT EXISTS ""PaymentTransactions"" (
                                    ""Id"" integer GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
                                    ""UserId"" integer NOT NULL,
                                    ""TxRef"" character varying(100) NOT NULL,
                                    ""ChapaReference"" character varying(100) NULL,
                                    ""Amount"" numeric(18,2) NOT NULL,
                                    ""Currency"" character varying(10) NOT NULL DEFAULT 'ETB',
                                    ""Status"" character varying(30) NOT NULL DEFAULT 'Pending',
                                    ""PaymentMethod"" character varying(50) NOT NULL DEFAULT 'Chapa',
                                    ""CreatedAt"" timestamp with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
                                    ""CompletedAt"" timestamp with time zone NULL,
                                    ""ErrorMessage"" character varying(500) NULL,
                                    CONSTRAINT ""FK_PaymentTransactions_Users_UserId"" FOREIGN KEY (""UserId"") REFERENCES ""Users"" (""Id"") ON DELETE CASCADE
                                );
                                CREATE UNIQUE INDEX IF NOT EXISTS ""IX_PaymentTransactions_TxRef"" ON ""PaymentTransactions"" (""TxRef"");
                            ");
                        }
                        else
                        {
                            await _context.Database.ExecuteSqlRawAsync(@"
                                CREATE TABLE IF NOT EXISTS PaymentTransactions (
                                    Id INTEGER PRIMARY KEY AUTOINCREMENT,
                                    UserId INTEGER NOT NULL,
                                    TxRef TEXT NOT NULL,
                                    ChapaReference TEXT NULL,
                                    Amount TEXT NOT NULL,
                                    Currency TEXT NOT NULL,
                                    Status TEXT NOT NULL,
                                    PaymentMethod TEXT NOT NULL,
                                    CreatedAt TEXT NOT NULL,
                                    CompletedAt TEXT NULL,
                                    ErrorMessage TEXT NULL,
                                    FOREIGN KEY(UserId) REFERENCES Users(Id) ON DELETE CASCADE
                                );");
                        }

                        _context.Entry(paymentTx).State = EntityState.Added;
                        await _context.SaveChangesAsync();
                    }
                    catch (Exception exRetry)
                    {
                        _logger.LogError(exRetry, "Database repair failed while saving payment transaction");
                        var detail = exRetry.InnerException?.Message ?? exRetry.Message;
                        return new InitializePaymentResponseDto
                        {
                            Success = false,
                            Message = $"Database error saving transaction: {detail}"
                        };
                    }
                }

                return new InitializePaymentResponseDto
                {
                    Success = true,
                    Message = "Payment initiated successfully.",
                    CheckoutUrl = chapaResult.Data.CheckoutUrl,
                    TxRef = txRef
                };
            }

            string errorDetail = chapaResult?.Message ?? string.Empty;
            if (string.IsNullOrWhiteSpace(errorDetail))
            {
                try
                {
                    using var doc = JsonDocument.Parse(responseBody);
                    if (doc.RootElement.TryGetProperty("message", out var msgElem))
                        errorDetail = msgElem.GetString() ?? responseBody;
                    else
                        errorDetail = responseBody;
                }
                catch
                {
                    errorDetail = responseBody;
                }
            }

            return new InitializePaymentResponseDto
            {
                Success = false,
                Message = !string.IsNullOrWhiteSpace(errorDetail) ? errorDetail : $"Chapa returned {response.StatusCode}"
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error initializing Chapa payment for user {UserId}", userId);
            var innerMsg = ex.InnerException?.Message;
            return new InitializePaymentResponseDto
            {
                Success = false,
                Message = !string.IsNullOrWhiteSpace(innerMsg) 
                    ? $"Payment initiation failed: {innerMsg}" 
                    : $"Payment initiation failed: {ex.Message}"
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
                Message = $"Verification error: {ex.InnerException?.Message ?? ex.Message}",
                TxRef = cleanTxRef
            };
        }
    }
}

