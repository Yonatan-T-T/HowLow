using UniqueLow.Api.DTOs;

namespace UniqueLow.Api.Services;

public interface IChapaService
{
    Task<InitializePaymentResponseDto> InitializePaymentAsync(int userId, InitializePaymentDto dto);
    Task<VerifyPaymentResponseDto> VerifyPaymentAsync(string txRef);
}

