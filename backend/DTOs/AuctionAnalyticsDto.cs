using UniqueLow.Api.Models;

namespace UniqueLow.Api.DTOs;

public class ResolveAuctionResultDto
{
    public int AuctionId { get; set; }
    public string Title { get; set; } = string.Empty;
    public AuctionStatus Status { get; set; }
    public bool LowestUniqueBidFound { get; set; }
    public int? WinnerUserId { get; set; }
    public string? WinnerUsername { get; set; }
    public decimal? WinningBidAmount { get; set; }
    public decimal RetailValue { get; set; }
    public decimal? SavingsAmount { get; set; }
    public decimal? SavingsPercent { get; set; }
    public int TotalBids { get; set; }
    public int UniqueBidsCount { get; set; }
    public int DuplicateBidsCount { get; set; }
    public string Message { get; set; } = string.Empty;
}

public class BidGroupAnalyticsDto
{
    public decimal Amount { get; set; }
    public int Count { get; set; }
    public bool IsUnique => Count == 1;
    public bool IsWinning { get; set; }
    public List<string> BidderUsernames { get; set; } = new();
}

public class AuctionAnalyticsDto
{
    public int AuctionId { get; set; }
    public string Title { get; set; } = string.Empty;
    public AuctionStatus Status { get; set; }
    public decimal RetailValue { get; set; }
    public decimal RegistrationFee { get; set; }
    public DateTime EndTime { get; set; }
    public int TotalRegistrations { get; set; }
    public int TotalBids { get; set; }
    public int UniqueBidsCount { get; set; }
    public int DuplicateBidsCount { get; set; }
    public decimal? WinningBidAmount { get; set; }
    public string? WinnerUsername { get; set; }
    public List<BidGroupAnalyticsDto> BidDistribution { get; set; } = new();
}

public class BidDto
{
    public int Id { get; set; }
    public int AuctionItemId { get; set; }
    public int UserId { get; set; }
    public decimal Amount { get; set; }
    public DateTime PlacedAt { get; set; }
    public bool? IsUniqueAfterResolution { get; set; }
    public bool IsWinner { get; set; }
}
