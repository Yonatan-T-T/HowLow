using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace UniqueLow.Api.Models;

public class Bid
{
    [Key]
    public int Id { get; set; }

    [Required]
    public int AuctionItemId { get; set; }
    [ForeignKey(nameof(AuctionItemId))]
    public AuctionItem AuctionItem { get; set; } = null!;

    [Required]
    public int UserId { get; set; }
    [ForeignKey(nameof(UserId))]
    public User User { get; set; } = null!;

    [Column(TypeName = "decimal(18,2)")]
    public decimal Amount { get; set; }

    public DateTime PlacedAt { get; set; } = DateTime.UtcNow;
}
