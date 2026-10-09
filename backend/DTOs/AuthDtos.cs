using System.ComponentModel.DataAnnotations;

namespace UniqueLow.Api.DTOs;

public class RegisterRequestDto
{
    [Required]
    [MinLength(3, ErrorMessage = "Username must be at least 3 characters")]
    [MaxLength(50, ErrorMessage = "Username cannot exceed 50 characters")]
    public string Username { get; set; } = string.Empty;

    [Required]
    [EmailAddress(ErrorMessage = "Invalid email format")]
    [MaxLength(150)]
    public string Email { get; set; } = string.Empty;

    [Required]
    [MinLength(6, ErrorMessage = "Password must be at least 6 characters")]
    [MaxLength(100)]
    public string Password { get; set; } = string.Empty;

    [Required(ErrorMessage = "Telebirr Phone Number is required")]
    [RegularExpression(@"^(\+251|0)?[79]\d{8}$", ErrorMessage = "Please enter a valid Ethiopian Telebirr phone number (e.g., 0912345678 or 0712345678)")]
    public string PhoneNumber { get; set; } = string.Empty;

    public string Role { get; set; } = "User"; // "Admin" or "User"
}

public class LoginRequestDto
{
    [Required(ErrorMessage = "Username or Email is required")]
    public string UsernameOrEmail { get; set; } = string.Empty;

    [Required(ErrorMessage = "Password is required")]
    public string Password { get; set; } = string.Empty;
}

public class AuthResponseDto
{
    public bool Success { get; set; }
    public string Message { get; set; } = string.Empty;
    public string Token { get; set; } = string.Empty;
    public UserDto? User { get; set; }
}

public class TestProfileDto
{
    public string Username { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string PhoneNumber { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public string Role { get; set; } = "User";
    public decimal Balance { get; set; }
}
