using System.ComponentModel.DataAnnotations;

namespace UniqueLow.Api.DTOs;

public class RegisterAuctionDto
{
    [Required]
    public int UserId { get; set; }
}

public class PlaceBidDto
{
    [Required]
    public int UserId { get; set; }

    [Required]
    [Range(0.01, 100000.00, ErrorMessage = "Bid amount must be at least $0.01")]
    public decimal Amount { get; set; }
}
