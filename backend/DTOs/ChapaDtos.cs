using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace UniqueLow.Api.DTOs;

public class InitializePaymentDto
{
    [Required]
    [Range(5.00, 100000.00, ErrorMessage = "Top-up amount must be between 5 ETB and 100,000 ETB")]
    public decimal Amount { get; set; }

    public string? ReturnUrl { get; set; }
}

public class InitializePaymentResponseDto
{
    public bool Success { get; set; }
    public string Message { get; set; } = string.Empty;
    public string? CheckoutUrl { get; set; }
    public string? TxRef { get; set; }
}

public class VerifyPaymentResponseDto
{
    public bool Success { get; set; }
    public string Message { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public decimal NewBalance { get; set; }
    public string? TxRef { get; set; }
    public string? Status { get; set; }
}

// Chapa API v2 Request & Response Mappings
public class ChapaCustomerDto
{
    [JsonPropertyName("first_name")]
    public string? FirstName { get; set; }

    [JsonPropertyName("last_name")]
    public string? LastName { get; set; }

    [JsonPropertyName("email")]
    public string? Email { get; set; }

    [JsonPropertyName("phone_number")]
    public string? PhoneNumber { get; set; }
}

public class ChapaCustomizationDto
{
    [JsonPropertyName("title")]
    public string? Title { get; set; }

    [JsonPropertyName("description")]
    public string? Description { get; set; }
}

public class ChapaHostedPaymentRequest
{
    [JsonPropertyName("amount")]
    public long AmountInCents { get; set; }

    [JsonPropertyName("currency")]
    public string Currency { get; set; } = "ETB";

    [JsonPropertyName("merchant_reference")]
    public string MerchantReference { get; set; } = string.Empty;

    [JsonPropertyName("customer")]
    public ChapaCustomerDto Customer { get; set; } = new();

    [JsonPropertyName("return_url")]
    public string? ReturnUrl { get; set; }

    [JsonPropertyName("callback_url")]
    public string? CallbackUrl { get; set; }

    [JsonPropertyName("customization")]
    public ChapaCustomizationDto Customization { get; set; } = new();
}

public class ChapaHostedPaymentResponseData
{
    [JsonPropertyName("checkout_url")]
    public string? CheckoutUrl { get; set; }
}

public class ChapaHostedPaymentResponse
{
    [JsonPropertyName("status")]
    public string? Status { get; set; }

    [JsonPropertyName("message")]
    public string? Message { get; set; }

    [JsonPropertyName("data")]
    public ChapaHostedPaymentResponseData? Data { get; set; }
}

public class ChapaVerifyResponseData
{
    [JsonPropertyName("merchant_reference")]
    public string? MerchantReference { get; set; }

    [JsonPropertyName("amount")]
    public long? Amount { get; set; }

    [JsonPropertyName("currency")]
    public string? Currency { get; set; }

    [JsonPropertyName("status")]
    public string? Status { get; set; }

    [JsonPropertyName("payment_method")]
    public string? PaymentMethod { get; set; }

    [JsonPropertyName("chapa_reference")]
    public string? ChapaReference { get; set; }
}

public class ChapaVerifyResponse
{
    [JsonPropertyName("status")]
    public string? Status { get; set; }

    [JsonPropertyName("message")]
    public string? Message { get; set; }

    [JsonPropertyName("data")]
    public ChapaVerifyResponseData? Data { get; set; }
}

