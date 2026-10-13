using System.ComponentModel.DataAnnotations;

namespace UniqueLow.Api.DTOs;

public class UserPostItemDto
{
    public int? UserId { get; set; }

    [Required]
    [MaxLength(200)]
    public string Title { get; set; } = string.Empty;

    [Required]
    [MaxLength(2000)]
    public string Description { get; set; } = string.Empty;

    [Required]
    [Url]
    [MaxLength(1000)]
    public string ImageUrl { get; set; } = string.Empty;

    [Range(5.00, 10000.00)]
    public decimal RegistrationFee { get; set; }

    [Range(100.00, 10000000.00)]
    public decimal RetailValue { get; set; }

    [Required]
    public DateTime EndTime { get; set; }

    public bool ConditionIsBrandNew { get; set; } = true;

    [Required]
    [MaxLength(500)]
    public string AuthenticityDeclaration { get; set; } = string.Empty;
}

public class RejectAuctionDto
{
    [MaxLength(500)]
    public string Reason { get; set; } = string.Empty;

    public bool RefundFee { get; set; } = true;
}

public class CancelFraudAuctionDto
{
    [Required]
    [MaxLength(500)]
    public string Reason { get; set; } = "Violation of Brand New & Authenticity policy. 1,000 Birr listing fee forfeited.";
}
