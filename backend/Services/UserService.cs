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
}
