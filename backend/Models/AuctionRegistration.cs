using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace UniqueLow.Api.Models;

public class AuctionRegistration
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

    public DateTime RegisteredAt { get; set; } = DateTime.UtcNow;

    [Column(TypeName = "decimal(18,2)")]
    public decimal FeePaid { get; set; }
}
