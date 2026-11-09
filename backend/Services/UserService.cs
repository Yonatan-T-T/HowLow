using Microsoft.EntityFrameworkCore;
using UniqueLow.Api.Data;
using UniqueLow.Api.DTOs;

namespace UniqueLow.Api.Services;

public class UserService : IUserService
{
    private readonly AppDbContext _context;

    public UserService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<UserDto>> GetAllUsersAsync()
    {
        return await _context.Users
            .OrderBy(u => u.Id)
            .Select(u => new UserDto
            {
                Id = u.Id,
                Username = u.Username,
                Email = u.Email,
                Balance = u.Balance,
                Role = u.Role,
                PhoneNumber = u.PhoneNumber
            })
            .ToListAsync();
    }

    public async Task<UserDto?> GetUserByIdAsync(int id)
    {
        var user = await _context.Users.FindAsync(id);
        if (user == null) return null;

        return new UserDto
        {
            Id = user.Id,
            Username = user.Username,
            Email = user.Email,
            Balance = user.Balance,
            Role = user.Role,
            PhoneNumber = user.PhoneNumber
        };
    }

    public async Task<(bool Success, string Message, decimal NewBalance)> DepositFundsAsync(int userId, decimal amount)
    {
        var user = await _context.Users.FindAsync(userId);
        if (user == null)
            return (false, "User not found", 0);

        var rounded = Math.Round(amount, 2);
        if (rounded <= 0)
            return (false, "Deposit amount must be greater than zero", user.Balance);

        user.Balance += rounded;
        await _context.SaveChangesAsync();

        return (true, $"Successfully deposited ${rounded:F2}. New balance: ${user.Balance:F2}", user.Balance);
    }

    public async Task<UpdateProfileResponseDto> UpdateProfileAsync(int userId, UpdateProfileDto dto)
    {
        var user = await _context.Users.FindAsync(userId);
        if (user == null)
        {
            return new UpdateProfileResponseDto
            {
                Success = false,
                Message = "User not found."
            };
        }

        var cleanUsername = dto.Username.Trim();
        var cleanEmail = dto.Email.Trim().ToLowerInvariant();
        var cleanPhone = dto.PhoneNumber?.Trim() ?? string.Empty;

        // Check unique username if changed
        if (!string.Equals(user.Username, cleanUsername, StringComparison.OrdinalIgnoreCase))
        {
            var isTaken = await _context.Users.AnyAsync(u => u.Id != userId && u.Username.ToLower() == cleanUsername.ToLower());
            if (isTaken)
            {
                return new UpdateProfileResponseDto
                {
                    Success = false,
                    Message = $"Username '{cleanUsername}' is already taken. Please choose another."
                };
            }
        }

        // Check unique email if changed
        if (!string.Equals(user.Email, cleanEmail, StringComparison.OrdinalIgnoreCase))
        {
            var isEmailTaken = await _context.Users.AnyAsync(u => u.Id != userId && u.Email.ToLower() == cleanEmail);
            if (isEmailTaken)
            {
                return new UpdateProfileResponseDto
                {
                    Success = false,
                    Message = $"Email '{cleanEmail}' is already associated with another account."
                };
            }
        }

        // Handle password change if requested
        if (!string.IsNullOrWhiteSpace(dto.NewPassword))
        {
            if (string.IsNullOrWhiteSpace(dto.CurrentPassword))
            {
                return new UpdateProfileResponseDto
                {
                    Success = false,
                    Message = "Current password is required to set a new password."
                };
            }

            if (!PasswordHasher.VerifyPassword(dto.CurrentPassword, user.PasswordHash, user.PasswordSalt))
            {
                return new UpdateProfileResponseDto
                {
                    Success = false,
                    Message = "Current password does not match our records."
                };
            }

            if (dto.NewPassword.Length < 6)
            {
                return new UpdateProfileResponseDto
                {
                    Success = false,
                    Message = "New password must be at least 6 characters long."
                };
            }

            PasswordHasher.CreatePasswordHash(dto.NewPassword, out string hash, out string salt);
            user.PasswordHash = hash;
            user.PasswordSalt = salt;
        }

        // Apply changes
        user.Username = cleanUsername;
        user.Email = cleanEmail;
        user.PhoneNumber = cleanPhone;

        await _context.SaveChangesAsync();

        var updatedDto = new UserDto
        {
            Id = user.Id,
            Username = user.Username,
            Email = user.Email,
            Balance = user.Balance,
            Role = user.Role,
            PhoneNumber = user.PhoneNumber
        };

        var token = PasswordHasher.GenerateAuthToken(user.Id, user.Role, user.Username);

        return new UpdateProfileResponseDto
        {
            Success = true,
            Message = "Profile updated successfully!",
            User = updatedDto,
            Token = token
        };
    }
}
