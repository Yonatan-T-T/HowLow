using UniqueLow.Api.DTOs;

namespace UniqueLow.Api.Services;

public interface IAuthService
{
    Task<AuthResponseDto> RegisterAsync(RegisterRequestDto dto);
    Task<AuthResponseDto> LoginAsync(LoginRequestDto dto);
    Task<UserDto?> GetUserByIdAsync(int userId);
    IEnumerable<TestProfileDto> GetTestProfiles();
}
