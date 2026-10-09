using Microsoft.EntityFrameworkCore;
using UniqueLow.Api.Models;
using UniqueLow.Api.Services;

namespace UniqueLow.Api.Data;

public static class DbInitializer
{
    public static async Task SeedAsync(AppDbContext context)
    {
        await context.Database.EnsureCreatedAsync();

        // Check if database needs seeding or updating with passwords
        if (await context.Users.AnyAsync())
        {
            // If existing users have empty password hashes, populate them
            var usersWithoutPassword = await context.Users
                .Where(u => string.IsNullOrEmpty(u.PasswordHash))
                .ToListAsync();

            if (usersWithoutPassword.Any())
            {
                foreach (var user in usersWithoutPassword)
                {
                    string defaultPass = user.Role == "Admin" ? "AdminPassword123!" : "UserPassword123!";
                    PasswordHasher.CreatePasswordHash(defaultPass, out string hash, out string salt);
                    user.PasswordHash = hash;
                    user.PasswordSalt = salt;
                }
                await context.SaveChangesAsync();
            }

            // Ensure 2 Admins exist
            if (!await context.Users.AnyAsync(u => u.Username.ToLower() == "admin2"))
            {
                PasswordHasher.CreatePasswordHash("AdminPassword123!", out string h2, out string s2);
                context.Users.Add(new User
                {
                    Username = "admin2",
                    Email = "admin2@uniquelow.com",
                    Balance = 1000.00m,
                    Role = "Admin",
                    PasswordHash = h2,
                    PasswordSalt = s2,
                    CreatedAt = DateTime.UtcNow
                });
                await context.SaveChangesAsync();
            }

            // Ensure 5 Users exist (e.g. fiona)
            if (!await context.Users.AnyAsync(u => u.Username.ToLower() == "fiona"))
            {
                PasswordHasher.CreatePasswordHash("UserPassword123!", out string hf, out string sf);
                context.Users.Add(new User
                {
                    Username = "fiona",
                    Email = "fiona@example.com",
                    Balance = 300.00m,
                    Role = "User",
                    PasswordHash = hf,
                    PasswordSalt = sf,
                    CreatedAt = DateTime.UtcNow
                });
                await context.SaveChangesAsync();
            }

            return; // DB already initialized
        }

        // 1. Seed 2 Admins and 5 Users
        PasswordHasher.CreatePasswordHash("AdminPassword123!", out string admin1Hash, out string admin1Salt);
        var admin1 = new User
        {
            Username = "admin1",
            Email = "admin1@uniquelow.com",
            Balance = 1000.00m,
            Role = "Admin",
            PasswordHash = admin1Hash,
            PasswordSalt = admin1Salt,
            CreatedAt = DateTime.UtcNow
        };

        PasswordHasher.CreatePasswordHash("AdminPassword123!", out string admin2Hash, out string admin2Salt);
        var admin2 = new User
        {
            Username = "admin2",
            Email = "admin2@uniquelow.com",
            Balance = 1000.00m,
            Role = "Admin",
            PasswordHash = admin2Hash,
            PasswordSalt = admin2Salt,
            CreatedAt = DateTime.UtcNow
        };

        PasswordHasher.CreatePasswordHash("UserPassword123!", out string userPassHash, out string userPassSalt);

        var bob = new User
        {
            Username = "bob",
            Email = "bob@example.com",
            Balance = 250.00m,
            Role = "User",
            PasswordHash = userPassHash,
            PasswordSalt = userPassSalt,
            CreatedAt = DateTime.UtcNow
        };

        var charlie = new User
        {
            Username = "charlie",
            Email = "charlie@example.com",
            Balance = 180.00m,
            Role = "User",
            PasswordHash = userPassHash,
            PasswordSalt = userPassSalt,
            CreatedAt = DateTime.UtcNow
        };

        var diana = new User
        {
            Username = "diana",
            Email = "diana@example.com",
            Balance = 220.00m,
            Role = "User",
            PasswordHash = userPassHash,
            PasswordSalt = userPassSalt,
            CreatedAt = DateTime.UtcNow
        };

        var evan = new User
        {
            Username = "evan",
            Email = "evan@example.com",
            Balance = 150.00m,
            Role = "User",
            PasswordHash = userPassHash,
            PasswordSalt = userPassSalt,
            CreatedAt = DateTime.UtcNow
        };

        var fiona = new User
        {
            Username = "fiona",
            Email = "fiona@example.com",
            Balance = 300.00m,
            Role = "User",
            PasswordHash = userPassHash,
            PasswordSalt = userPassSalt,
            CreatedAt = DateTime.UtcNow
        };

        context.Users.AddRange(admin1, admin2, bob, charlie, diana, evan, fiona);
        await context.SaveChangesAsync();

        // 2. Seed Auctions
        var now = DateTime.UtcNow;

        var iphoneAuction = new AuctionItem
        {
            Title = "Apple iPhone 16 Pro Max 256GB - Desert Titanium",
            Description = "The flagship iPhone 16 Pro Max features a grade 5 titanium design, Camera Control, 4K 120 fps Dolby Vision, and the powerful A18 Pro chip with Apple Intelligence.",
            ImageUrl = "https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=1200&q=80",
            RegistrationFee = 5.00m,
            RetailValue = 1199.00m,
            EndTime = now.AddMinutes(45),
            Status = AuctionStatus.Active,
            CreatedAt = now.AddDays(-2)
        };

        var ps5Auction = new AuctionItem
        {
            Title = "Sony PlayStation 5 Pro 2TB Console",
            Description = "Witness play unleashed with PlayStation Spectral Super Resolution (PSSR), advanced ray tracing, and ultra-smooth 60fps / 120fps 4K gaming with 2TB high-speed NVMe storage.",
            ImageUrl = "https://images.unsplash.com/photo-1606813907291-d86efa9b94db?auto=format&fit=crop&w=1200&q=80",
            RegistrationFee = 3.50m,
            RetailValue = 699.99m,
            EndTime = now.AddHours(2),
            Status = AuctionStatus.Active,
            CreatedAt = now.AddDays(-1)
        };

        var macbookAuction = new AuctionItem
        {
            Title = "MacBook Pro 14\" M3 Pro - Space Black",
            Description = "Powered by the Apple M3 Pro chip with an 11-core CPU and 14-core GPU. Liquid Retina XDR display with up to 1000 nits sustained brightness and 18 hours battery life.",
            ImageUrl = "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=1200&q=80",
            RegistrationFee = 8.00m,
            RetailValue = 1999.00m,
            EndTime = now.AddDays(1).AddHours(6),
            Status = AuctionStatus.Active,
            CreatedAt = now.AddHours(-18)
        };

        var rolexAuction = new AuctionItem
        {
            Title = "Rolex Submariner Date 41mm Oystersteel",
            Description = "The quintessential divers' watch. Oystersteel case with Cerachrom black ceramic bezel, black dial with luminescent Chromalight display, and Calibre 3235 automatic movement.",
            ImageUrl = "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1200&q=80",
            RegistrationFee = 25.00m,
            RetailValue = 10250.00m,
            EndTime = now.AddDays(3),
            Status = AuctionStatus.Active,
            CreatedAt = now.AddDays(-1)
        };

        var boseAuction = new AuctionItem
        {
            Title = "Bose QuietComfort Ultra Wireless Headphones",
            Description = "World-class active noise cancellation with breakthrough Bose Immersive Audio, CustomTune technology, and 24 hours of battery life.",
            ImageUrl = "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1200&q=80",
            RegistrationFee = 2.50m,
            RetailValue = 429.00m,
            EndTime = now.AddHours(-3),
            Status = AuctionStatus.Closed,
            WinnerUserId = bob.Id,
            WinningBidAmount = 0.23m,
            CreatedAt = now.AddDays(-3)
        };

        var dysonAuction = new AuctionItem
        {
            Title = "Dyson Supersonic Nural Intelligent Hair Dryer",
            Description = "Features a network of Nural sensors that automatically adjust airflow and heat to protect scalp health and enhance natural shine.",
            ImageUrl = "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=1200&q=80",
            RegistrationFee = 3.00m,
            RetailValue = 499.99m,
            EndTime = now.AddHours(-10),
            Status = AuctionStatus.Closed,
            WinnerUserId = diana.Id,
            WinningBidAmount = 1.14m,
            CreatedAt = now.AddDays(-4)
        };

        context.AuctionItems.AddRange(iphoneAuction, ps5Auction, macbookAuction, rolexAuction, boseAuction, dysonAuction);
        await context.SaveChangesAsync();

        // 3. Seed Registrations for iPhone & PS5 auctions
        context.AuctionRegistrations.AddRange(
            new AuctionRegistration { AuctionItemId = iphoneAuction.Id, UserId = bob.Id, FeePaid = 5.00m, RegisteredAt = now.AddHours(-5) },
            new AuctionRegistration { AuctionItemId = iphoneAuction.Id, UserId = charlie.Id, FeePaid = 5.00m, RegisteredAt = now.AddHours(-4) },
            new AuctionRegistration { AuctionItemId = iphoneAuction.Id, UserId = diana.Id, FeePaid = 5.00m, RegisteredAt = now.AddHours(-3) },
            new AuctionRegistration { AuctionItemId = iphoneAuction.Id, UserId = evan.Id, FeePaid = 5.00m, RegisteredAt = now.AddHours(-2) },
            new AuctionRegistration { AuctionItemId = iphoneAuction.Id, UserId = fiona.Id, FeePaid = 5.00m, RegisteredAt = now.AddHours(-1) },
            
            // PS5 registrations
            new AuctionRegistration { AuctionItemId = ps5Auction.Id, UserId = bob.Id, FeePaid = 3.50m, RegisteredAt = now.AddHours(-1) },
            new AuctionRegistration { AuctionItemId = ps5Auction.Id, UserId = charlie.Id, FeePaid = 3.50m, RegisteredAt = now.AddMinutes(-30) },
            new AuctionRegistration { AuctionItemId = ps5Auction.Id, UserId = fiona.Id, FeePaid = 3.50m, RegisteredAt = now.AddMinutes(-20) },

            // Closed auctions historical registrations
            new AuctionRegistration { AuctionItemId = boseAuction.Id, UserId = bob.Id, FeePaid = 2.50m, RegisteredAt = now.AddDays(-1) },
            new AuctionRegistration { AuctionItemId = boseAuction.Id, UserId = diana.Id, FeePaid = 2.50m, RegisteredAt = now.AddDays(-1) },
            new AuctionRegistration { AuctionItemId = dysonAuction.Id, UserId = diana.Id, FeePaid = 3.00m, RegisteredAt = now.AddDays(-2) }
        );
        await context.SaveChangesAsync();

        // 4. Seed Bids for iPhone auction
        context.Bids.AddRange(
            new Bid { AuctionItemId = iphoneAuction.Id, UserId = bob.Id, Amount = 0.05m, PlacedAt = now.AddHours(-4) },
            new Bid { AuctionItemId = iphoneAuction.Id, UserId = charlie.Id, Amount = 0.05m, PlacedAt = now.AddHours(-3).AddMinutes(15) },
            new Bid { AuctionItemId = iphoneAuction.Id, UserId = diana.Id, Amount = 0.12m, PlacedAt = now.AddHours(-2).AddMinutes(40) },
            new Bid { AuctionItemId = iphoneAuction.Id, UserId = evan.Id, Amount = 0.45m, PlacedAt = now.AddHours(-1).AddMinutes(10) },
            new Bid { AuctionItemId = iphoneAuction.Id, UserId = fiona.Id, Amount = 0.88m, PlacedAt = now.AddMinutes(-15) },

            // Closed Bose bids
            new Bid { AuctionItemId = boseAuction.Id, UserId = diana.Id, Amount = 0.15m, PlacedAt = now.AddHours(-4) },
            new Bid { AuctionItemId = boseAuction.Id, UserId = evan.Id, Amount = 0.15m, PlacedAt = now.AddHours(-4).AddMinutes(5) },
            new Bid { AuctionItemId = boseAuction.Id, UserId = bob.Id, Amount = 0.23m, PlacedAt = now.AddHours(-3).AddMinutes(30) },

            // Closed Dyson bids
            new Bid { AuctionItemId = dysonAuction.Id, UserId = diana.Id, Amount = 1.14m, PlacedAt = now.AddHours(-11) }
        );

        await context.SaveChangesAsync();
    }
}
