using System.ComponentModel.DataAnnotations;

namespace UniqueLow.Api.DTOs;

public class UserDto
{
    public int Id { get; set; }
    public string Username { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public decimal Balance { get; set; }
    public string Role { get; set; } = "User";
    public string PhoneNumber { get; set; } = string.Empty;
}

public class WalletDepositDto
{
    [Required]
    [Range(1.00, 10000.00, ErrorMessage = "Deposit amount must be between $1 and $10,000")]
    public decimal Amount { get; set; }
}
