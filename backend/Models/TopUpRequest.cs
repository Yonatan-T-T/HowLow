using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace UniqueLow.Api.Models;

public class TopUpRequest
{
    [Key]
    public int Id { get; set; }

    [Required]
    public int UserId { get; set; }

    [ForeignKey(nameof(UserId))]
    public User? User { get; set; }

    [Required]
    [MaxLength(30)]
    public string SenderPhoneNumber { get; set; } = string.Empty;

    [Required]
    [MaxLength(30)]
    public string ReceiverPhoneNumber { get; set; } = string.Empty;

    [Required]
    [MaxLength(100)]
    public string ReceiverName { get; set; } = string.Empty;

    [Column(TypeName = "decimal(18,2)")]
    public decimal Amount { get; set; }

    [Required]
    [MaxLength(100)]
    public string TransactionNumber { get; set; } = string.Empty;

    [Required]
    [MaxLength(30)]
    public string Status { get; set; } = "Pending"; // "Pending", "Approved", "Rejected"

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime? ReviewedAt { get; set; }

    [MaxLength(100)]
    public string? ReviewedBy { get; set; }

    [MaxLength(500)]
    public string? AdminNotes { get; set; }
}
