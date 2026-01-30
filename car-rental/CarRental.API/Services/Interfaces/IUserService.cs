using CarRental.API.DTOs.User;
using CarRental.API.DTOs.Common;

namespace CarRental.API.Services.Interfaces;

public interface IUserService
{
    Task<UserDto?> GetByIdAsync(int userId);
    Task<PageResponse<UserListDto>> GetAllAsync(int page, int size, string? search = null);
    Task<UserDto?> UpdateProfileAsync(int userId, UpdateProfileRequest request);
    Task<UserDetailDto?> GetUserDetailAsync(int userId);
    Task<UserDetailDto?> UpdateUserDetailAsync(int userId, UpdateUserDetailRequest request);
    Task<bool> DeleteUserAsync(int userId);
    Task<bool> ToggleActiveAsync(int userId);
    Task<IEnumerable<BankAccountDto>> GetBankAccountsAsync(int userId);
    Task<BankAccountDto> AddBankAccountAsync(int userId, CreateBankAccountRequest request);
    Task<bool> DeleteBankAccountAsync(int userId, int bankAccountId);
    Task<bool> SetPrimaryBankAccountAsync(int userId, int bankAccountId);
}
