using UniqueLow.Api.DTOs;

namespace UniqueLow.Api.Services;

public interface IUserService
{
    Task<IEnumerable<UserDto>> GetAllUsersAsync();
    Task<UserDto?> GetUserByIdAsync(int id);
    Task<(bool Success, string Message, decimal NewBalance)> DepositFundsAsync(int userId, decimal amount);
}
