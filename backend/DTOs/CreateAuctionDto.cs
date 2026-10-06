using System.ComponentModel.DataAnnotations;

namespace UniqueLow.Api.DTOs;

public class CreateAuctionDto
{
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

    [Range(0.00, 100000.00)]
    public decimal RegistrationFee { get; set; }

    [Range(0.01, 1000000.00)]
    public decimal RetailValue { get; set; }

    [Required]
    public DateTime EndTime { get; set; }
}
