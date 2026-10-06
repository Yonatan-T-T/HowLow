using Microsoft.EntityFrameworkCore;
using UniqueLow.Api.Data;
using UniqueLow.Api.DTOs;
using UniqueLow.Api.Models;

namespace UniqueLow.Api.Services;

public class AuctionService : IAuctionService
{
    private readonly AppDbContext _context;
    private readonly ILogger<AuctionService> _logger;

    public AuctionService(AppDbContext context, ILogger<AuctionService> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<IEnumerable<AuctionItemDto>> GetAuctionsAsync(int? currentUserId, string? statusFilter)
    {
        var query = _context.AuctionItems
            .Include(a => a.WinnerUser)
            .Include(a => a.Registrations)
            .Include(a => a.Bids)
            .AsNoTracking()
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(statusFilter))
        {
            if (Enum.TryParse<AuctionStatus>(statusFilter, true, out var parsedStatus))
            {
                query = query.Where(a => a.Status == parsedStatus);
            }
        }

        var items = await query
            .OrderByDescending(a => a.Status == AuctionStatus.Active)
            .ThenBy(a => a.EndTime)
            .ToListAsync();

        return items.Select(a => MapToDto(a, currentUserId));
    }

    public async Task<AuctionItemDto?> GetAuctionByIdAsync(int id, int? currentUserId)
    {
        var item = await _context.AuctionItems
            .Include(a => a.WinnerUser)
            .Include(a => a.Registrations)
            .Include(a => a.Bids)
            .AsNoTracking()
            .FirstOrDefaultAsync(a => a.Id == id);

        return item == null ? null : MapToDto(item, currentUserId);
    }

    public async Task<AuctionItemDto> CreateAuctionAsync(CreateAuctionDto dto)
    {
        var auction = new AuctionItem
        {
            Title = dto.Title.Trim(),
            Description = dto.Description.Trim(),
            ImageUrl = dto.ImageUrl.Trim(),
            RegistrationFee = Math.Round(dto.RegistrationFee, 2),
            RetailValue = Math.Round(dto.RetailValue, 2),
            EndTime = dto.EndTime.ToUniversalTime(),
            Status = AuctionStatus.Active,
            CreatedAt = DateTime.UtcNow
        };

        _context.AuctionItems.Add(auction);
        await _context.SaveChangesAsync();

        _logger.LogInformation("Created new auction {AuctionId}: {Title}", auction.Id, auction.Title);
        return MapToDto(auction, null);
    }

    public async Task<(bool Success, string Message, decimal NewBalance)> RegisterUserAsync(int auctionId, int userId)
    {
        var auction = await _context.AuctionItems.FindAsync(auctionId);
        if (auction == null)
            return (false, "Auction item not found.", 0);

        if (auction.Status != AuctionStatus.Active)
            return (false, "Cannot register: auction is no longer active.", 0);

        if (DateTime.UtcNow >= auction.EndTime)
            return (false, "Cannot register: auction registration has closed.", 0);

        var user = await _context.Users.FindAsync(userId);
        if (user == null)
            return (false, "User not found.", 0);

        if (string.Equals(user.Role, "Admin", StringComparison.OrdinalIgnoreCase))
            return (false, "Admins cannot participate in auctions or place bids.", user.Balance);

        var alreadyRegistered = await _context.AuctionRegistrations
            .AnyAsync(r => r.AuctionItemId == auctionId && r.UserId == userId);

        if (alreadyRegistered)
            return (false, "User is already registered for this auction.", user.Balance);

        if (user.Balance < auction.RegistrationFee)
        {
            return (false, $"Insufficient balance. Fee is ${auction.RegistrationFee:F2}, but your balance is ${user.Balance:F2}.", user.Balance);
        }

        // Deduct fee and register
        user.Balance -= auction.RegistrationFee;

        var registration = new AuctionRegistration
        {
            AuctionItemId = auctionId,
            UserId = userId,
            FeePaid = auction.RegistrationFee,
            RegisteredAt = DateTime.UtcNow
        };

        _context.AuctionRegistrations.Add(registration);
        await _context.SaveChangesAsync();

        _logger.LogInformation("User {UserId} registered for auction {AuctionId} with fee {Fee}", userId, auctionId, auction.RegistrationFee);
        return (true, "Registration successful! You may now place secret bids.", user.Balance);
    }

    public async Task<(bool Success, string Message, Bid? Bid)> PlaceBidAsync(int auctionId, int userId, decimal amount)
    {
        var auction = await _context.AuctionItems.FindAsync(auctionId);
        if (auction == null)
            return (false, "Auction item not found.", null);

        if (auction.Status != AuctionStatus.Active)
            return (false, "Cannot bid: auction is closed.", null);

        if (DateTime.UtcNow >= auction.EndTime)
            return (false, "Cannot bid: auction time has expired.", null);

        var user = await _context.Users.FindAsync(userId);
        if (user == null)
            return (false, "User not found.", null);

        if (string.Equals(user.Role, "Admin", StringComparison.OrdinalIgnoreCase))
            return (false, "Admins cannot participate in auctions or place bids.", null);

        var isRegistered = await _context.AuctionRegistrations
            .AnyAsync(r => r.AuctionItemId == auctionId && r.UserId == userId);

        if (!isRegistered)
            return (false, "Access denied. You must register and pay the entry fee before bidding.", null);

        var roundedAmount = Math.Round(amount, 2);
        if (roundedAmount <= 0.00m)
            return (false, "Bid amount must be greater than $0.00.", null);

        var bid = new Bid
        {
            AuctionItemId = auctionId,
            UserId = userId,
            Amount = roundedAmount,
            PlacedAt = DateTime.UtcNow
        };

        _context.Bids.Add(bid);
        await _context.SaveChangesAsync();

        _logger.LogInformation("Bid placed on auction {AuctionId} by user {UserId}: ${Amount:F2}", auctionId, userId, roundedAmount);
        return (true, $"Blind bid of ${roundedAmount:F2} successfully placed! It will remain confidential until auction resolution.", bid);
    }

    /// <summary>
    /// Explicit Lowest Unique Bid Resolution Algorithm
    /// 1. Retrieve all bids for the specified auction.
    /// 2. Group all bids by Amount.
    /// 3. Filter for groups with Count == 1 (Unique bids).
    /// 4. Order unique bids ascending to find the lowest value.
    /// 5. Declare the single bidder of that amount as the winner.
    /// 6. Handle edge case: If no bid is unique, flag auction as NoWinner.
    /// </summary>
    public async Task<ResolveAuctionResultDto> ResolveLowestUniqueBidAsync(int auctionId)
    {
        var auction = await _context.AuctionItems
            .Include(a => a.WinnerUser)
            .FirstOrDefaultAsync(a => a.Id == auctionId);

        if (auction == null)
            throw new KeyNotFoundException($"Auction with ID {auctionId} does not exist.");

        // Retrieve all bids with bidder details
        var allBids = await _context.Bids
            .Include(b => b.User)
            .Where(b => b.AuctionItemId == auctionId)
            .ToListAsync();

        int totalBids = allBids.Count;

        // Group bids by amount
        var bidGroups = allBids
            .GroupBy(b => b.Amount)
            .Select(g => new
            {
                Amount = g.Key,
                Count = g.Count(),
                Bids = g.ToList()
            })
            .ToList();

        int uniqueBidsCount = bidGroups.Count(g => g.Count == 1);
        int duplicateBidsCount = bidGroups.Where(g => g.Count > 1).Sum(g => g.Count);

        // Edge case: No bids placed at all
        if (totalBids == 0)
        {
            auction.Status = AuctionStatus.NoWinner;
            auction.WinnerUserId = null;
            auction.WinningBidAmount = null;
            await _context.SaveChangesAsync();

            return new ResolveAuctionResultDto
            {
                AuctionId = auction.Id,
                Title = auction.Title,
                Status = auction.Status,
                LowestUniqueBidFound = false,
                TotalBids = 0,
                UniqueBidsCount = 0,
                DuplicateBidsCount = 0,
                RetailValue = auction.RetailValue,
                Message = "No bids were placed on this auction. Status set to No Winner."
            };
        }

        // Clean LINQ: Filter for unique bids (Count == 1) and order ascending by amount
        var lowestUniqueGroup = bidGroups
            .Where(g => g.Count == 1)
            .OrderBy(g => g.Amount)
            .FirstOrDefault();

        if (lowestUniqueGroup == null)
        {
            // Edge case: All placed bids have duplicates, no unique bid exists
            auction.Status = AuctionStatus.NoWinner;
            auction.WinnerUserId = null;
            auction.WinningBidAmount = null;
            await _context.SaveChangesAsync();

            _logger.LogInformation("Auction {AuctionId} resolved with NO WINNER (all {Count} bids had duplicates).", auctionId, totalBids);

            return new ResolveAuctionResultDto
            {
                AuctionId = auction.Id,
                Title = auction.Title,
                Status = auction.Status,
                LowestUniqueBidFound = false,
                TotalBids = totalBids,
                UniqueBidsCount = 0,
                DuplicateBidsCount = duplicateBidsCount,
                RetailValue = auction.RetailValue,
                Message = "Every bid was duplicated by two or more bidders! No lowest unique bid exists. Auction ended with No Winner."
            };
        }

        // Winner identified!
        var winningBid = lowestUniqueGroup.Bids.First();
        var winner = winningBid.User;

        auction.Status = AuctionStatus.Closed;
        auction.WinnerUserId = winner.Id;
        auction.WinningBidAmount = winningBid.Amount;
        await _context.SaveChangesAsync();

        decimal savingsAmount = Math.Max(0, auction.RetailValue - winningBid.Amount);
        decimal savingsPercent = auction.RetailValue > 0 
            ? Math.Round((savingsAmount / auction.RetailValue) * 100m, 1) 
            : 0m;

        _logger.LogInformation("Auction {AuctionId} RESOLVED! Winner: {Username} (Id: {UserId}) with Lowest Unique Bid: ${Amount:F2}",
            auctionId, winner.Username, winner.Id, winningBid.Amount);

        return new ResolveAuctionResultDto
        {
            AuctionId = auction.Id,
            Title = auction.Title,
            Status = auction.Status,
            LowestUniqueBidFound = true,
            WinnerUserId = winner.Id,
            WinnerUsername = winner.Username,
            WinningBidAmount = winningBid.Amount,
            RetailValue = auction.RetailValue,
            SavingsAmount = savingsAmount,
            SavingsPercent = savingsPercent,
            TotalBids = totalBids,
            UniqueBidsCount = uniqueBidsCount,
            DuplicateBidsCount = duplicateBidsCount,
            Message = $"Congratulations to {winner.Username}! Won with the Lowest Unique Bid of ${winningBid.Amount:F2} (saved {savingsPercent}% off ${auction.RetailValue:N2})."
        };
    }

    public async Task<AuctionAnalyticsDto?> GetAuctionAnalyticsAsync(int auctionId)
    {
        var auction = await _context.AuctionItems
            .Include(a => a.WinnerUser)
            .Include(a => a.Registrations)
            .AsNoTracking()
            .FirstOrDefaultAsync(a => a.Id == auctionId);

        if (auction == null) return null;

        var allBids = await _context.Bids
            .Include(b => b.User)
            .Where(b => b.AuctionItemId == auctionId)
            .AsNoTracking()
            .ToListAsync();

        var groups = allBids
            .GroupBy(b => b.Amount)
            .OrderBy(g => g.Key)
            .Select(g => new BidGroupAnalyticsDto
            {
                Amount = g.Key,
                Count = g.Count(),
                IsWinning = auction.WinningBidAmount.HasValue && auction.WinningBidAmount.Value == g.Key,
                BidderUsernames = g.Select(b => b.User.Username).ToList()
            })
            .ToList();

        int uniqueCount = groups.Count(g => g.Count == 1);
        int duplicateCount = groups.Where(g => g.Count > 1).Sum(g => g.Count);

        return new AuctionAnalyticsDto
        {
            AuctionId = auction.Id,
            Title = auction.Title,
            Status = auction.Status,
            RetailValue = auction.RetailValue,
            RegistrationFee = auction.RegistrationFee,
            EndTime = auction.EndTime,
            TotalRegistrations = auction.Registrations.Count,
            TotalBids = allBids.Count,
            UniqueBidsCount = uniqueCount,
            DuplicateBidsCount = duplicateCount,
            WinningBidAmount = auction.WinningBidAmount,
            WinnerUsername = auction.WinnerUser?.Username,
            BidDistribution = groups
        };
    }

    public async Task<IEnumerable<BidDto>> GetUserBidsForAuctionAsync(int auctionId, int userId)
    {
        var auction = await _context.AuctionItems
            .AsNoTracking()
            .FirstOrDefaultAsync(a => a.Id == auctionId);

        var bids = await _context.Bids
            .Where(b => b.AuctionItemId == auctionId && b.UserId == userId)
            .OrderByDescending(b => b.PlacedAt)
            .AsNoTracking()
            .ToListAsync();

        // If auction is closed, we can reveal whether the bid was unique or not
        bool isClosed = auction?.Status == AuctionStatus.Closed || auction?.Status == AuctionStatus.NoWinner;

        Dictionary<decimal, int>? amountCounts = null;
        if (isClosed)
        {
            amountCounts = await _context.Bids
                .Where(b => b.AuctionItemId == auctionId)
                .GroupBy(b => b.Amount)
                .ToDictionaryAsync(g => g.Key, g => g.Count());
        }

        return bids.Select(b => new BidDto
        {
            Id = b.Id,
            AuctionItemId = b.AuctionItemId,
            UserId = b.UserId,
            Amount = b.Amount,
            PlacedAt = b.PlacedAt,
            IsUniqueAfterResolution = isClosed && amountCounts != null && amountCounts.TryGetValue(b.Amount, out var count)
                ? count == 1
                : null,
            IsWinner = auction != null && auction.WinnerUserId == userId && auction.WinningBidAmount == b.Amount
        });
    }

    public async Task<bool> CancelAuctionAsync(int auctionId)
    {
        var auction = await _context.AuctionItems.FindAsync(auctionId);
        if (auction == null) return false;

        auction.Status = AuctionStatus.Cancelled;
        await _context.SaveChangesAsync();
        return true;
    }

    private static AuctionItemDto MapToDto(AuctionItem item, int? currentUserId)
    {
        bool isUserRegistered = false;
        int userBidsCount = 0;

        if (currentUserId.HasValue)
        {
            isUserRegistered = item.Registrations.Any(r => r.UserId == currentUserId.Value);
            userBidsCount = item.Bids.Count(b => b.UserId == currentUserId.Value);
        }

        return new AuctionItemDto
        {
            Id = item.Id,
            Title = item.Title,
            Description = item.Description,
            ImageUrl = item.ImageUrl,
            RegistrationFee = item.RegistrationFee,
            RetailValue = item.RetailValue,
            EndTime = item.EndTime,
            Status = item.Status,
            WinnerUserId = item.WinnerUserId,
            WinnerUsername = item.WinnerUser?.Username,
            WinningBidAmount = item.WinningBidAmount,
            TotalRegistrations = item.Registrations.Count,
            TotalBids = item.Bids.Count,
            IsUserRegistered = isUserRegistered,
            UserBidsCount = userBidsCount,
            CreatedAt = item.CreatedAt
        };
    }
}
