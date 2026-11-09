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

public class UpdateProfileDto
{
    [Required]
    [MinLength(3, ErrorMessage = "Username must be at least 3 characters")]
    public string Username { get; set; } = string.Empty;

    [Required]
    [EmailAddress(ErrorMessage = "Invalid email format")]
    public string Email { get; set; } = string.Empty;

    public string PhoneNumber { get; set; } = string.Empty;

    public string? CurrentPassword { get; set; }
    public string? NewPassword { get; set; }
}

public class UpdateProfileResponseDto
{
    public bool Success { get; set; }
    public string Message { get; set; } = string.Empty;
    public UserDto? User { get; set; }
    public string? Token { get; set; }
}
