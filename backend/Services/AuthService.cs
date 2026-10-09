using Microsoft.EntityFrameworkCore;
using UniqueLow.Api.Data;
using UniqueLow.Api.DTOs;
using UniqueLow.Api.Models;

namespace UniqueLow.Api.Services;

public class AuthService : IAuthService
{
    private readonly AppDbContext _context;

    public AuthService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<AuthResponseDto> RegisterAsync(RegisterRequestDto dto)
    {
        var cleanUsername = dto.Username.Trim();
        var cleanEmail = dto.Email.Trim().ToLowerInvariant();

        // 1. Check existing username
        var existingUsername = await _context.Users
            .AnyAsync(u => u.Username.ToLower() == cleanUsername.ToLower());
        if (existingUsername)
        {
            return new AuthResponseDto
            {
                Success = false,
                Message = $"Username '{cleanUsername}' is already taken. Please choose another."
            };
        }

        // 2. Check existing email
        var existingEmail = await _context.Users
            .AnyAsync(u => u.Email.ToLower() == cleanEmail);
        if (existingEmail)
        {
            return new AuthResponseDto
            {
                Success = false,
                Message = $"An account with email '{cleanEmail}' already exists."
            };
        }

        // 3. Hash password
        PasswordHasher.CreatePasswordHash(dto.Password, out string hash, out string salt);

        // 4. Create new User
        var role = string.Equals(dto.Role?.Trim(), "Admin", StringComparison.OrdinalIgnoreCase) 
            ? "Admin" 
            : "User";

        var user = new User
        {
            Username = cleanUsername,
            Email = cleanEmail,
            Balance = 100.00m, // Welcome balance
            Role = role,
            PasswordHash = hash,
            PasswordSalt = salt,
            CreatedAt = DateTime.UtcNow
        };

        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        var userDto = new UserDto
        {
            Id = user.Id,
            Username = user.Username,
            Email = user.Email,
            Balance = user.Balance,
            Role = user.Role
        };

        var token = GenerateAuthToken(user);

        return new AuthResponseDto
        {
            Success = true,
            Message = "Account successfully registered!",
            Token = token,
            User = userDto
        };
    }

    public async Task<AuthResponseDto> LoginAsync(LoginRequestDto dto)
    {
        var identifier = dto.UsernameOrEmail.Trim().ToLowerInvariant();

        // Look up user by username or email
        var user = await _context.Users
            .FirstOrDefaultAsync(u => u.Username.ToLower() == identifier || u.Email.ToLower() == identifier);

        if (user == null)
        {
            return new AuthResponseDto
            {
                Success = false,
                Message = "Invalid credentials. Please verify your username or password."
            };
        }

        // Verify password
        bool isPasswordValid = PasswordHasher.VerifyPassword(dto.Password, user.PasswordHash, user.PasswordSalt);
        if (!isPasswordValid)
        {
            return new AuthResponseDto
            {
                Success = false,
                Message = "Invalid credentials. Please verify your username or password."
            };
        }

        var userDto = new UserDto
        {
            Id = user.Id,
            Username = user.Username,
            Email = user.Email,
            Balance = user.Balance,
            Role = user.Role
        };

        var token = GenerateAuthToken(user);

        return new AuthResponseDto
        {
            Success = true,
            Message = $"Welcome back, {user.Username}!",
            Token = token,
            User = userDto
        };
    }

    public async Task<UserDto?> GetUserByIdAsync(int userId)
    {
        var user = await _context.Users.FindAsync(userId);
        if (user == null) return null;

        return new UserDto
        {
            Id = user.Id,
            Username = user.Username,
            Email = user.Email,
            Balance = user.Balance,
            Role = user.Role
        };
    }

    public IEnumerable<TestProfileDto> GetTestProfiles()
    {
        return new List<TestProfileDto>
        {
            // 2 Admin Profiles
            new TestProfileDto
            {
                Username = "admin1",
                Email = "admin1@uniquelow.com",
                Password = "AdminPassword123!",
                Role = "Admin",
                Balance = 1000.00m
            },
            new TestProfileDto
            {
                Username = "admin2",
                Email = "admin2@uniquelow.com",
                Password = "AdminPassword123!",
                Role = "Admin",
                Balance = 1000.00m
            },

            // 5 User Profiles
            new TestProfileDto
            {
                Username = "bob",
                Email = "bob@example.com",
                Password = "UserPassword123!",
                Role = "User",
                Balance = 250.00m
            },
            new TestProfileDto
            {
                Username = "charlie",
                Email = "charlie@example.com",
                Password = "UserPassword123!",
                Role = "User",
                Balance = 180.00m
            },
            new TestProfileDto
            {
                Username = "diana",
                Email = "diana@example.com",
                Password = "UserPassword123!",
                Role = "User",
                Balance = 220.00m
            },
            new TestProfileDto
            {
                Username = "evan",
                Email = "evan@example.com",
                Password = "UserPassword123!",
                Role = "User",
                Balance = 150.00m
            },
            new TestProfileDto
            {
                Username = "fiona",
                Email = "fiona@example.com",
                Password = "UserPassword123!",
                Role = "User",
                Balance = 300.00m
            }
        };
    }

    private static string GenerateAuthToken(User user)
    {
        var timestamp = DateTimeOffset.UtcNow.ToUnixTimeSeconds();
        var raw = $"{user.Id}:{user.Role}:{user.Username}:{timestamp}:{Guid.NewGuid():N}";
        return Convert.ToBase64String(System.Text.Encoding.UTF8.GetBytes(raw));
    }
}
