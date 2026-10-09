using Microsoft.EntityFrameworkCore;
using UniqueLow.Api.Data;
using UniqueLow.Api.DTOs;
using UniqueLow.Api.Services;
using Xunit;

namespace UniqueLow.Tests;

public class AuthTests
{
    private AppDbContext CreateInMemoryDbContext()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        return new AppDbContext(options);
    }

    [Fact]
    public void PasswordHasher_ShouldCorrectlyHashAndVerifyPassword()
    {
        string rawPassword = "SecurePassword123!";
        PasswordHasher.CreatePasswordHash(rawPassword, out string hash, out string salt);

        Assert.False(string.IsNullOrWhiteSpace(hash));
        Assert.False(string.IsNullOrWhiteSpace(salt));

        bool isValid = PasswordHasher.VerifyPassword(rawPassword, hash, salt);
        Assert.True(isValid);

        bool isInvalid = PasswordHasher.VerifyPassword("WrongPassword!", hash, salt);
        Assert.False(isInvalid);
    }

    [Fact]
    public async Task AuthService_ShouldRegisterNewUser_AndPreventDuplicateUsername()
    {
        using var context = CreateInMemoryDbContext();
        var authService = new AuthService(context);

        var registerDto = new RegisterRequestDto
        {
            Username = "newplayer",
            Email = "player@test.com",
            Password = "SecretPassword123!"
        };

        var result = await authService.RegisterAsync(registerDto);

        Assert.True(result.Success);
        Assert.NotNull(result.User);
        Assert.Equal("newplayer", result.User.Username);
        Assert.Equal(100.00m, result.User.Balance);
        Assert.False(string.IsNullOrEmpty(result.Token));

        // Try registering duplicate username
        var dupResult = await authService.RegisterAsync(registerDto);
        Assert.False(dupResult.Success);
        Assert.Contains("already taken", dupResult.Message);
    }

    [Fact]
    public async Task AuthService_ShouldLoginExistingUser_WithUsernameOrEmail()
    {
        using var context = CreateInMemoryDbContext();
        var authService = new AuthService(context);

        await authService.RegisterAsync(new RegisterRequestDto
        {
            Username = "johndoe",
            Email = "john@test.com",
            Password = "Password123!"
        });

        // Login with username
        var loginUserRes = await authService.LoginAsync(new LoginRequestDto
        {
            UsernameOrEmail = "johndoe",
            Password = "Password123!"
        });
        Assert.True(loginUserRes.Success);
        Assert.NotNull(loginUserRes.User);

        // Login with email
        var loginEmailRes = await authService.LoginAsync(new LoginRequestDto
        {
            UsernameOrEmail = "john@test.com",
            Password = "Password123!"
        });
        Assert.True(loginEmailRes.Success);
        Assert.NotNull(loginEmailRes.User);

        // Login with wrong password
        var failRes = await authService.LoginAsync(new LoginRequestDto
        {
            UsernameOrEmail = "johndoe",
            Password = "WrongPassword!"
        });
        Assert.False(failRes.Success);
    }

    [Fact]
    public void AuthService_ShouldProvideTestProfiles_WithTwoAdminsAndFiveUsers()
    {
        using var context = CreateInMemoryDbContext();
        var authService = new AuthService(context);

        var testProfiles = authService.GetTestProfiles().ToList();

        Assert.Equal(7, testProfiles.Count);
        Assert.Equal(2, testProfiles.Count(p => p.Role == "Admin"));
        Assert.Equal(5, testProfiles.Count(p => p.Role == "User"));

        // Verify test accounts have non-empty username, email, and password
        foreach (var profile in testProfiles)
        {
            Assert.False(string.IsNullOrWhiteSpace(profile.Username));
            Assert.False(string.IsNullOrWhiteSpace(profile.Email));
            Assert.False(string.IsNullOrWhiteSpace(profile.Password));
        }
    }
}
