using UniqueLow.Api.Models;

namespace UniqueLow.Api.DTOs;

public class AuctionItemDto
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string ImageUrl { get; set; } = string.Empty;
    public decimal RegistrationFee { get; set; }
    public decimal RetailValue { get; set; }
    public DateTime EndTime { get; set; }
    public AuctionStatus Status { get; set; }
    public int? WinnerUserId { get; set; }
    public string? WinnerUsername { get; set; }
    public decimal? WinningBidAmount { get; set; }
    public int TotalRegistrations { get; set; }
    public int TotalBids { get; set; }
    public bool IsUserRegistered { get; set; }
    public int UserBidsCount { get; set; }
    public DateTime CreatedAt { get; set; }
}
