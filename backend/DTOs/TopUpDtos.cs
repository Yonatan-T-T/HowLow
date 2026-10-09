using System.ComponentModel.DataAnnotations;

namespace UniqueLow.Api.DTOs;

public class CreateTopUpRequestDto
{
    [Required]
    [Range(50.00, 15000.00, ErrorMessage = "Top-up amount must be between 50.00 ETB and 15,000.00 ETB")]
    public decimal Amount { get; set; }

    [Required(ErrorMessage = "Receiver phone number is required")]
    public string ReceiverPhoneNumber { get; set; } = string.Empty;

    [Required(ErrorMessage = "Receiver name is required")]
    public string ReceiverName { get; set; } = string.Empty;

    [Required(ErrorMessage = "Telebirr transaction number is required")]
    [MinLength(6, ErrorMessage = "Transaction number must be at least 6 characters")]
    public string TransactionNumber { get; set; } = string.Empty;

    public string? SenderPhoneNumber { get; set; }
}

public class TopUpRequestDto
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public string Username { get; set; } = string.Empty;
    public string UserEmail { get; set; } = string.Empty;
    public string SenderPhoneNumber { get; set; } = string.Empty;
    public string ReceiverPhoneNumber { get; set; } = string.Empty;
    public string ReceiverName { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public string TransactionNumber { get; set; } = string.Empty;
    public string Status { get; set; } = "Pending";
    public DateTime CreatedAt { get; set; }
    public DateTime? ReviewedAt { get; set; }
    public string? ReviewedBy { get; set; }
    public string? AdminNotes { get; set; }
}

public class AgentAccountDto
{
    public string ReceiverPhoneNumber { get; set; } = string.Empty;
    public string ReceiverName { get; set; } = string.Empty;
}

public class RejectTopUpDto
{
    public string? Reason { get; set; }
}
