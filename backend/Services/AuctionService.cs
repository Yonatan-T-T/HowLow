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
            .Include(a => a.SellerUser)
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
        else
        {
            // By default, public catalog only shows active, closed, and resolved/cancelled auctions, hiding pending approval and rejected items
            query = query.Where(a => a.Status != AuctionStatus.PendingApproval && a.Status != AuctionStatus.Rejected);
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
            .Include(a => a.SellerUser)
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

        if (auction.SellerUserId.HasValue && auction.SellerUserId.Value == userId)
            return (false, "Sellers cannot participate in or bid on their own auctions to ensure lowest unique bid integrity.", user.Balance);

        var alreadyRegistered = await _context.AuctionRegistrations
            .AnyAsync(r => r.AuctionItemId == auctionId && r.UserId == userId);

        if (alreadyRegistered)
            return (false, "User is already registered for this auction.", user.Balance);

        if (user.Balance < auction.RegistrationFee)
        {
            return (false, $"Insufficient balance. Fee is {auction.RegistrationFee:F2} Birr, but your balance is {user.Balance:F2} Birr.", user.Balance);
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

        if (auction.SellerUserId.HasValue && auction.SellerUserId.Value == userId)
            return (false, "Sellers cannot place bids on their own auctions.", null);

        var isRegistered = await _context.AuctionRegistrations
            .AnyAsync(r => r.AuctionItemId == auctionId && r.UserId == userId);

        if (!isRegistered)
            return (false, "Access denied. You must register and pay the entry fee before bidding.", null);

        var hasAlreadyBid = await _context.Bids
            .AnyAsync(b => b.AuctionItemId == auctionId && b.UserId == userId);

        if (hasAlreadyBid)
            return (false, "You have already placed a bid for this auction. Each bidder is limited to one bid per auction.", null);

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
            .Include(a => a.SellerUser)
            .Include(a => a.Registrations)
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

            // Settle registration fees if any
            if (auction.SellerUserId.HasValue)
            {
                decimal totalRegRevenue = auction.Registrations.Sum(r => r.FeePaid);
                decimal sellerShare = Math.Round(totalRegRevenue * 0.60m, 2);
                decimal systemCut = totalRegRevenue - sellerShare;
                auction.SellerPayoutAmount = sellerShare;
                auction.SystemProfitAmount = systemCut;

                if (sellerShare > 0)
                {
                    var sellerUser = await _context.Users.FindAsync(auction.SellerUserId.Value);
                    if (sellerUser != null)
                    {
                        sellerUser.Balance += sellerShare;
                    }
                }
            }

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

            // Settle 60/40 profit from registration revenue
            if (auction.SellerUserId.HasValue)
            {
                decimal totalRegRevenue = auction.Registrations.Sum(r => r.FeePaid);
                decimal sellerShare = Math.Round(totalRegRevenue * 0.60m, 2);
                decimal systemCut = totalRegRevenue - sellerShare;
                auction.SellerPayoutAmount = sellerShare;
                auction.SystemProfitAmount = systemCut;

                if (sellerShare > 0)
                {
                    var sellerUser = await _context.Users.FindAsync(auction.SellerUserId.Value);
                    if (sellerUser != null)
                    {
                        sellerUser.Balance += sellerShare;
                    }
                }
            }

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

        // Profit Sharing (Rule 2: 60% Seller / 40% System)
        if (auction.SellerUserId.HasValue)
        {
            decimal totalRegRevenue = auction.Registrations.Sum(r => r.FeePaid);
            decimal winningBidRevenue = winningBid.Amount;
            decimal grossAuctionRevenue = totalRegRevenue + winningBidRevenue;

            decimal sellerShare = Math.Round(grossAuctionRevenue * 0.60m, 2);
            decimal systemCut = grossAuctionRevenue - sellerShare;

            auction.SellerPayoutAmount = sellerShare;
            auction.SystemProfitAmount = systemCut;

            if (sellerShare > 0)
            {
                var sellerUser = await _context.Users.FindAsync(auction.SellerUserId.Value);
                if (sellerUser != null)
                {
                    sellerUser.Balance += sellerShare;
                    _logger.LogInformation("Settled 60% profit to seller {SellerId} ({SellerName}): {Amount} Birr. Platform retained 40%: {PlatformAmount} Birr.",
                        sellerUser.Id, sellerUser.Username, sellerShare, systemCut);
                }
            }
        }

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

    public async Task<(bool Success, string Message, AuctionItemDto? Item, decimal NewBalance)> UserPostItemAsync(int userId, UserPostItemDto dto)
    {
        var user = await _context.Users.FindAsync(userId);
        if (user == null)
            return (false, "User not found.", null, 0);

        const decimal postingFee = 1000.00m;

        if (user.Balance < postingFee)
        {
            return (false, $"Insufficient balance. Posting an item requires a 1,000 Birr listing fee. Your balance is {user.Balance:F2} Birr. Please top up your wallet first.", null, user.Balance);
        }

        if (!dto.ConditionIsBrandNew)
        {
            return (false, "Rule Violation: All items listed on HowLow must be 100% brand new and in original condition.", null, user.Balance);
        }

        if (string.IsNullOrWhiteSpace(dto.AuthenticityDeclaration))
        {
            return (false, "You must provide an authenticity and original condition declaration before posting.", null, user.Balance);
        }

        if (dto.EndTime <= DateTime.UtcNow.AddMinutes(15))
        {
            return (false, "Auction end time must be at least 15 minutes in the future.", null, user.Balance);
        }

        // Deduct 1,000 Birr listing fee (Rule 1)
        user.Balance -= postingFee;

        var auction = new AuctionItem
        {
            Title = dto.Title.Trim(),
            Description = dto.Description.Trim(),
            ImageUrl = dto.ImageUrl.Trim(),
            RegistrationFee = Math.Round(dto.RegistrationFee, 2),
            RetailValue = Math.Round(dto.RetailValue, 2),
            EndTime = dto.EndTime.ToUniversalTime(),
            Status = AuctionStatus.PendingApproval, // Rule 4: Requires Admin Approval
            SellerUserId = user.Id,
            PostingFeePaid = postingFee,
            ConditionIsBrandNew = true,
            AuthenticityDeclaration = dto.AuthenticityDeclaration.Trim(),
            CreatedAt = DateTime.UtcNow
        };

        _context.AuctionItems.Add(auction);
        await _context.SaveChangesAsync();

        _logger.LogInformation("User {UserId} ({Username}) posted item {AuctionId} ('{Title}') with 1,000 Birr fee paid. Pending admin approval.",
            user.Id, user.Username, auction.Id, auction.Title);

        return (true, "Item submitted successfully! 1,000 Birr listing fee deducted. It will be visible to public bidders once reviewed and approved by an admin.", MapToDto(auction, userId), user.Balance);
    }

    public async Task<IEnumerable<AuctionItemDto>> GetPendingApprovalAuctionsAsync()
    {
        var items = await _context.AuctionItems
            .Include(a => a.SellerUser)
            .Include(a => a.WinnerUser)
            .Include(a => a.Registrations)
            .Include(a => a.Bids)
            .Where(a => a.Status == AuctionStatus.PendingApproval)
            .OrderByDescending(a => a.CreatedAt)
            .AsNoTracking()
            .ToListAsync();

        return items.Select(a => MapToDto(a, null));
    }

    public async Task<IEnumerable<AuctionItemDto>> GetUserPostedItemsAsync(int userId)
    {
        var items = await _context.AuctionItems
            .Include(a => a.SellerUser)
            .Include(a => a.WinnerUser)
            .Include(a => a.Registrations)
            .Include(a => a.Bids)
            .Where(a => a.SellerUserId == userId)
            .OrderByDescending(a => a.CreatedAt)
            .AsNoTracking()
            .ToListAsync();

        return items.Select(a => MapToDto(a, userId));
    }

    public async Task<(bool Success, string Message, AuctionItemDto? Item)> ApproveAuctionAsync(int auctionId, string adminUsername)
    {
        var auction = await _context.AuctionItems
            .Include(a => a.SellerUser)
            .Include(a => a.Registrations)
            .Include(a => a.Bids)
            .FirstOrDefaultAsync(a => a.Id == auctionId);

        if (auction == null)
            return (false, "Auction item not found.", null);

        if (auction.Status != AuctionStatus.PendingApproval)
            return (false, $"Auction is not pending approval (Current status: {auction.Status}).", null);

        // If scheduled EndTime is already in the past or close, extend it by 24 hours from now
        if (auction.EndTime <= DateTime.UtcNow.AddMinutes(30))
        {
            auction.EndTime = DateTime.UtcNow.AddHours(24);
        }

        auction.Status = AuctionStatus.Active;
        auction.ApprovedAt = DateTime.UtcNow;
        auction.ApprovedBy = adminUsername;

        await _context.SaveChangesAsync();

        _logger.LogInformation("Auction {AuctionId} approved by admin {Admin}. Now Active on public catalog.", auction.Id, adminUsername);
        return (true, $"Auction '{auction.Title}' approved and is now live for public bidding!", MapToDto(auction, null));
    }

    public async Task<(bool Success, string Message)> RejectAuctionAsync(int auctionId, string adminUsername, string reason, bool refundFee)
    {
        var auction = await _context.AuctionItems
            .Include(a => a.SellerUser)
            .FirstOrDefaultAsync(a => a.Id == auctionId);

        if (auction == null)
            return (false, "Auction item not found.");

        if (auction.Status != AuctionStatus.PendingApproval)
            return (false, $"Auction is not pending approval (Current status: {auction.Status}).");

        auction.Status = AuctionStatus.Rejected;
        auction.RejectionReason = reason;
        auction.ApprovedBy = adminUsername;
        auction.ApprovedAt = DateTime.UtcNow;

        string refundNotice;
        if (refundFee && auction.SellerUserId.HasValue)
        {
            var seller = await _context.Users.FindAsync(auction.SellerUserId.Value);
            if (seller != null)
            {
                seller.Balance += auction.PostingFeePaid;
            }
            refundNotice = "The 1,000 Birr listing fee was refunded to the seller's wallet.";
        }
        else
        {
            auction.FeeForfeited = true;
            refundNotice = "The 1,000 Birr listing fee was forfeited by the seller.";
        }

        await _context.SaveChangesAsync();
        _logger.LogInformation("Auction {AuctionId} rejected by {Admin}. {RefundNotice}", auction.Id, adminUsername, refundNotice);

        return (true, $"Item rejected. {refundNotice}");
    }

    public async Task<(bool Success, string Message)> CancelAuctionForFraudAsync(int auctionId, string adminUsername, string reason)
    {
        var auction = await _context.AuctionItems
            .Include(a => a.SellerUser)
            .Include(a => a.Registrations)
            .FirstOrDefaultAsync(a => a.Id == auctionId);

        if (auction == null)
            return (false, "Auction item not found.");

        auction.Status = AuctionStatus.Cancelled;
        auction.FeeForfeited = true;
        auction.RejectionReason = $"FRAUD / CONDITION VIOLATION: {reason} (1,000 Birr fee forfeited)";
        auction.ApprovedBy = adminUsername;

        // Refund all registered bidders their entry fees!
        int refundedBiddersCount = 0;
        foreach (var reg in auction.Registrations)
        {
            var bidder = await _context.Users.FindAsync(reg.UserId);
            if (bidder != null)
            {
                bidder.Balance += reg.FeePaid;
                refundedBiddersCount++;
            }
        }

        await _context.SaveChangesAsync();
        _logger.LogWarning("Auction {AuctionId} cancelled for fraud/fake by {Admin}. Seller fee forfeited. {Count} bidders refunded.",
            auction.Id, adminUsername, refundedBiddersCount);

        return (true, $"Auction cancelled due to authenticity/brand new condition violation. The seller's 1,000 Birr listing fee was forfeited, and {refundedBiddersCount} registered bidders were fully refunded.");
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

        bool isSeller = currentUserId.HasValue && item.SellerUserId.HasValue && item.SellerUserId.Value == currentUserId.Value;

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
            SellerUserId = item.SellerUserId,
            SellerUsername = item.SellerUser?.Username,
            PostingFeePaid = item.PostingFeePaid,
            ConditionIsBrandNew = item.ConditionIsBrandNew,
            AuthenticityDeclaration = item.AuthenticityDeclaration,
            ApprovedAt = item.ApprovedAt,
            ApprovedBy = item.ApprovedBy,
            RejectionReason = item.RejectionReason,
            FeeForfeited = item.FeeForfeited,
            SellerPayoutAmount = item.SellerPayoutAmount,
            SystemProfitAmount = item.SystemProfitAmount,
            IsSeller = isSeller,
            CreatedAt = item.CreatedAt
        };
    }
}
