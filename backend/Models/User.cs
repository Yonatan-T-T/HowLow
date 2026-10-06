using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace UniqueLow.Api.Models;

public class User
{
    [Key]
    public int Id { get; set; }

    [Required]
    [MaxLength(100)]
    public string Username { get; set; } = string.Empty;

    [Required]
    [EmailAddress]
    [MaxLength(200)]
    public string Email { get; set; } = string.Empty;

    [Column(TypeName = "decimal(18,2)")]
    public decimal Balance { get; set; } = 100.00m;

    [Required]
    [MaxLength(50)]
    public string Role { get; set; } = "User"; // "Admin" or "User"

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<AuctionRegistration> Registrations { get; set; } = new List<AuctionRegistration>();
    public ICollection<Bid> Bids { get; set; } = new List<Bid>();
}
