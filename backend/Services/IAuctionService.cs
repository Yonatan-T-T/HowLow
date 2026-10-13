using UniqueLow.Api.DTOs;
using UniqueLow.Api.Models;

namespace UniqueLow.Api.Services;

public interface IAuctionService
{
    Task<IEnumerable<AuctionItemDto>> GetAuctionsAsync(int? currentUserId, string? statusFilter);
    Task<AuctionItemDto?> GetAuctionByIdAsync(int id, int? currentUserId);
    Task<AuctionItemDto> CreateAuctionAsync(CreateAuctionDto dto);
    Task<(bool Success, string Message, decimal NewBalance)> RegisterUserAsync(int auctionId, int userId);
    Task<(bool Success, string Message, Bid? Bid)> PlaceBidAsync(int auctionId, int userId, decimal amount);
    Task<ResolveAuctionResultDto> ResolveLowestUniqueBidAsync(int auctionId);
    Task<AuctionAnalyticsDto?> GetAuctionAnalyticsAsync(int auctionId);
    Task<IEnumerable<BidDto>> GetUserBidsForAuctionAsync(int auctionId, int userId);
    Task<bool> CancelAuctionAsync(int auctionId);

    // User-submitted items and Admin approval workflow
    Task<(bool Success, string Message, AuctionItemDto? Item, decimal NewBalance)> UserPostItemAsync(int userId, UserPostItemDto dto);
    Task<IEnumerable<AuctionItemDto>> GetPendingApprovalAuctionsAsync();
    Task<IEnumerable<AuctionItemDto>> GetUserPostedItemsAsync(int userId);
    Task<(bool Success, string Message, AuctionItemDto? Item)> ApproveAuctionAsync(int auctionId, string adminUsername);
    Task<(bool Success, string Message)> RejectAuctionAsync(int auctionId, string adminUsername, string reason, bool refundFee);
    Task<(bool Success, string Message)> CancelAuctionForFraudAsync(int auctionId, string adminUsername, string reason);
}
