using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging.Abstractions;
using UniqueLow.Api.Data;
using UniqueLow.Api.Models;
using UniqueLow.Api.Services;
using Xunit;

namespace UniqueLow.Tests;

public class AuctionResolutionTests
{
    private AppDbContext CreateInMemoryDbContext()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        return new AppDbContext(options);
    }

    [Fact]
    public async Task ResolveLowestUniqueBid_WhenDuplicatesExist_PicksLowestUnique()
    {
        // Arrange
        using var context = CreateInMemoryDbContext();
        var logger = NullLogger<AuctionService>.Instance;
        var service = new AuctionService(context, logger);

        var alice = new User { Id = 1, Username = "Alice", Email = "alice@test.com", Balance = 100 };
        var bob = new User { Id = 2, Username = "Bob", Email = "bob@test.com", Balance = 100 };
        var charlie = new User { Id = 3, Username = "Charlie", Email = "charlie@test.com", Balance = 100 };
        var diana = new User { Id = 4, Username = "Diana", Email = "diana@test.com", Balance = 100 };
        context.Users.AddRange(alice, bob, charlie, diana);

        var auction = new AuctionItem
        {
            Id = 1,
            Title = "Test iPhone",
            Description = "Test",
            ImageUrl = "http://test.com/img.jpg",
            RegistrationFee = 5.00m,
            RetailValue = 1000.00m,
            EndTime = DateTime.UtcNow.AddMinutes(-5),
            Status = AuctionStatus.Active
        };
        context.AuctionItems.Add(auction);

        // Bids:
        // Alice: $0.05
        // Bob: $0.05  (Duplicate!)
        // Charlie: $0.12 (Unique, lowest!)
        // Diana: $0.45 (Unique, but higher)
        context.Bids.AddRange(
            new Bid { AuctionItemId = 1, UserId = 1, Amount = 0.05m },
            new Bid { AuctionItemId = 1, UserId = 2, Amount = 0.05m },
            new Bid { AuctionItemId = 1, UserId = 3, Amount = 0.12m },
            new Bid { AuctionItemId = 1, UserId = 4, Amount = 0.45m }
        );

        await context.SaveChangesAsync();

        // Act
        var result = await service.ResolveLowestUniqueBidAsync(1);

        // Assert
        Assert.True(result.LowestUniqueBidFound);
        Assert.Equal(AuctionStatus.Closed, result.Status);
        Assert.Equal(3, result.WinnerUserId); // Charlie
        Assert.Equal("Charlie", result.WinnerUsername);
        Assert.Equal(0.12m, result.WinningBidAmount);
        Assert.Equal(4, result.TotalBids);
        Assert.Equal(2, result.UniqueBidsCount); // 0.12 and 0.45
        Assert.Equal(2, result.DuplicateBidsCount); // 0.05 (x2)
    }

    [Fact]
    public async Task ResolveLowestUniqueBid_WhenAllBidsDuplicated_DeclaresNoWinner()
    {
        // Arrange
        using var context = CreateInMemoryDbContext();
        var logger = NullLogger<AuctionService>.Instance;
        var service = new AuctionService(context, logger);

        var u1 = new User { Id = 1, Username = "User1", Email = "u1@test.com" };
        var u2 = new User { Id = 2, Username = "User2", Email = "u2@test.com" };
        var u3 = new User { Id = 3, Username = "User3", Email = "u3@test.com" };
        var u4 = new User { Id = 4, Username = "User4", Email = "u4@test.com" };
        context.Users.AddRange(u1, u2, u3, u4);

        var auction = new AuctionItem
        {
            Id = 2,
            Title = "Tied Auction",
            Description = "Test",
            ImageUrl = "http://test.com/img.jpg",
            RegistrationFee = 1.00m,
            RetailValue = 500.00m,
            EndTime = DateTime.UtcNow.AddMinutes(-5),
            Status = AuctionStatus.Active
        };
        context.AuctionItems.Add(auction);

        // Bids:
        // u1: $0.10, u2: $0.10 (Duplicate)
        // u3: $0.25, u4: $0.25 (Duplicate)
        context.Bids.AddRange(
            new Bid { AuctionItemId = 2, UserId = 1, Amount = 0.10m },
            new Bid { AuctionItemId = 2, UserId = 2, Amount = 0.10m },
            new Bid { AuctionItemId = 2, UserId = 3, Amount = 0.25m },
            new Bid { AuctionItemId = 2, UserId = 4, Amount = 0.25m }
        );

        await context.SaveChangesAsync();

        // Act
        var result = await service.ResolveLowestUniqueBidAsync(2);

        // Assert
        Assert.False(result.LowestUniqueBidFound);
        Assert.Equal(AuctionStatus.NoWinner, result.Status);
        Assert.Null(result.WinnerUserId);
        Assert.Null(result.WinningBidAmount);
        Assert.Equal(0, result.UniqueBidsCount);
        Assert.Equal(4, result.DuplicateBidsCount);
    }

    [Fact]
    public async Task ResolveLowestUniqueBid_WhenNoBidsPlaced_SetsNoWinner()
    {
        // Arrange
        using var context = CreateInMemoryDbContext();
        var logger = NullLogger<AuctionService>.Instance;
        var service = new AuctionService(context, logger);

        var auction = new AuctionItem
        {
            Id = 3,
            Title = "Empty Auction",
            Description = "Test",
            ImageUrl = "http://test.com/img.jpg",
            RegistrationFee = 1.00m,
            RetailValue = 300.00m,
            EndTime = DateTime.UtcNow.AddMinutes(-5),
            Status = AuctionStatus.Active
        };
        context.AuctionItems.Add(auction);
        await context.SaveChangesAsync();

        // Act
        var result = await service.ResolveLowestUniqueBidAsync(3);

        // Assert
        Assert.False(result.LowestUniqueBidFound);
        Assert.Equal(AuctionStatus.NoWinner, result.Status);
        Assert.Null(result.WinnerUserId);
        Assert.Equal(0, result.TotalBids);
    }
}
