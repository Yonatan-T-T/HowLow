using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace UniqueLow.Api.Models;

public class AuctionItem
{
    [Key]
    public int Id { get; set; }

    [Required]
    [MaxLength(200)]
    public string Title { get; set; } = string.Empty;

    [Required]
    [MaxLength(2000)]
    public string Description { get; set; } = string.Empty;

    [Required]
    [MaxLength(1000)]
    public string ImageUrl { get; set; } = string.Empty;

    [Column(TypeName = "decimal(18,2)")]
    public decimal RegistrationFee { get; set; }

    [Column(TypeName = "decimal(18,2)")]
    public decimal RetailValue { get; set; }

    public DateTime EndTime { get; set; }

    public AuctionStatus Status { get; set; } = AuctionStatus.Active;

    public int? WinnerUserId { get; set; }
    [ForeignKey(nameof(WinnerUserId))]
    public User? WinnerUser { get; set; }

    [Column(TypeName = "decimal(18,2)")]
    public decimal? WinningBidAmount { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<AuctionRegistration> Registrations { get; set; } = new List<AuctionRegistration>();
    public ICollection<Bid> Bids { get; set; } = new List<Bid>();
}
