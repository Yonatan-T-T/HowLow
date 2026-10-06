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
}
