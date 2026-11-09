using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace UniqueLow.Api.Models;

public class PaymentTransaction
{
    [Key]
    public int Id { get; set; }

    [Required]
    public int UserId { get; set; }

    [ForeignKey(nameof(UserId))]
    public User? User { get; set; }

    [Required]
    [MaxLength(100)]
    public string TxRef { get; set; } = string.Empty; // merchant_reference

    [MaxLength(100)]
    public string? ChapaReference { get; set; }

    [Column(TypeName = "decimal(18,2)")]
    public decimal Amount { get; set; }

    [MaxLength(10)]
    public string Currency { get; set; } = "ETB";

    [Required]
    [MaxLength(30)]
    public string Status { get; set; } = "Pending"; // "Pending", "Success", "Failed"

    [MaxLength(50)]
    public string PaymentMethod { get; set; } = "Chapa";

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime? CompletedAt { get; set; }

    [MaxLength(500)]
    public string? ErrorMessage { get; set; }
}

