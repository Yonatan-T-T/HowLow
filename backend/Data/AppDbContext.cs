using Microsoft.EntityFrameworkCore;
using UniqueLow.Api.Models;

namespace UniqueLow.Api.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    public DbSet<User> Users => Set<User>();
    public DbSet<AuctionItem> AuctionItems => Set<AuctionItem>();
    public DbSet<AuctionRegistration> AuctionRegistrations => Set<AuctionRegistration>();
    public DbSet<Bid> Bids => Set<Bid>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Prevent duplicate registration by the same user on the same auction
        modelBuilder.Entity<AuctionRegistration>()
            .HasIndex(r => new { r.AuctionItemId, r.UserId })
            .IsUnique();

        // Index on AuctionItemId and Amount for rapid lowest unique bid calculation
        modelBuilder.Entity<Bid>()
            .HasIndex(b => new { b.AuctionItemId, b.Amount });

        // Configure cascade deletes
        modelBuilder.Entity<AuctionRegistration>()
            .HasOne(r => r.AuctionItem)
            .WithMany(a => a.Registrations)
            .HasForeignKey(r => r.AuctionItemId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Bid>()
            .HasOne(b => b.AuctionItem)
            .WithMany(a => a.Bids)
            .HasForeignKey(b => b.AuctionItemId)
            .OnDelete(DeleteBehavior.Cascade);

        // Winner user relationship
        modelBuilder.Entity<AuctionItem>()
            .HasOne(a => a.WinnerUser)
            .WithMany()
            .HasForeignKey(a => a.WinnerUserId)
            .OnDelete(DeleteBehavior.SetNull);
    }
}
