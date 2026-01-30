using CarRental.API.Data;
using CarRental.API.DTOs.Common;
using CarRental.API.DTOs.User;
using CarRental.API.Models;
using CarRental.API.Repositories.Interfaces;
using CarRental.API.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace CarRental.API.Services;

public class UserService : IUserService
{
    private readonly IUserRepository _userRepo;
    private readonly ApplicationDbContext _context;

    public UserService(IUserRepository userRepo, ApplicationDbContext context)
    {
        _userRepo = userRepo;
        _context = context;
    }

    public async Task<UserDto?> GetByIdAsync(int userId)
    {
        var user = await _userRepo.GetWithDetailAsync(userId);
        return user == null ? null : MapToDto(user);
    }

    public async Task<PageResponse<UserListDto>> GetAllAsync(int page, int size, string? search = null)
    {
        var (items, total) = await _userRepo.GetPagedAsync(page, size, search);
        var dtos = items.Select(u => new UserListDto
        {
            UserId = u.UserId,
            Email = u.Email,
            FullName = u.FullName,
            AvatarUrl = u.AvatarUrl,
            RoleName = u.Role?.RoleName,
            IsActive = u.IsActive,
            CreatedAt = u.CreatedAt
        }).ToList();
        return PageResponse<UserListDto>.Create(dtos, page, size, total);
    }

    public async Task<UserDto?> UpdateProfileAsync(int userId, UpdateProfileRequest request)
    {
        var user = await _userRepo.GetByIdAsync(userId)
            ?? throw new KeyNotFoundException("User không tồn tại");

        if (request.FullName != null) user.FullName = request.FullName;
        if (request.Phone != null) user.Phone = request.Phone;
        if (request.CountryCode != null) user.CountryCode = request.CountryCode;
        if (request.AvatarUrl != null) user.AvatarUrl = request.AvatarUrl;
        user.UpdatedAt = DateTime.UtcNow;

        _userRepo.Update(user);

        // Update detail fields if provided
        var detail = await _context.UserDetails.FirstOrDefaultAsync(d => d.UserId == userId);
        if (detail == null)
        {
            detail = new UserDetail { UserId = userId };
            await _context.UserDetails.AddAsync(detail);
        }

        if (request.Address != null) detail.Address = request.Address;
        if (request.DateOfBirth.HasValue) detail.DateOfBirth = request.DateOfBirth;
        if (request.Gender != null) detail.Gender = request.Gender;
        detail.UpdatedAt = DateTime.UtcNow;

        await _userRepo.SaveChangesAsync();
        return await GetByIdAsync(userId);
    }

    public async Task<UserDetailDto?> GetUserDetailAsync(int userId)
    {
        var detail = await _context.UserDetails.FirstOrDefaultAsync(d => d.UserId == userId);
        return detail == null ? null : MapDetailToDto(detail);
    }

    public async Task<UserDetailDto?> UpdateUserDetailAsync(int userId, UpdateUserDetailRequest request)
    {
        var detail = await _context.UserDetails.FirstOrDefaultAsync(d => d.UserId == userId);
        if (detail == null)
        {
            detail = new UserDetail { UserId = userId };
            await _context.UserDetails.AddAsync(detail);
        }

        if (request.Address != null) detail.Address = request.Address;
        if (request.DateOfBirth.HasValue) detail.DateOfBirth = request.DateOfBirth;
        if (request.Gender != null) detail.Gender = request.Gender;
        if (request.NationalId != null) detail.NationalId = request.NationalId;
        if (request.NationalIdFrontImage != null) detail.NationalIdFrontImage = request.NationalIdFrontImage;
        if (request.NationalIdBackImage != null) detail.NationalIdBackImage = request.NationalIdBackImage;
        if (request.DrivingLicense != null) detail.DrivingLicense = request.DrivingLicense;
        if (request.DrivingLicenseFrontImage != null) detail.DrivingLicenseFrontImage = request.DrivingLicenseFrontImage;
        if (request.DrivingLicenseBackImage != null) detail.DrivingLicenseBackImage = request.DrivingLicenseBackImage;
        detail.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();
        return MapDetailToDto(detail);
    }

    public async Task<bool> DeleteUserAsync(int userId)
    {
        var user = await _userRepo.GetByIdAsync(userId)
            ?? throw new KeyNotFoundException("User không tồn tại");
        user.IsActive = false;
        user.UpdatedAt = DateTime.UtcNow;
        _userRepo.Update(user);
        await _userRepo.SaveChangesAsync();
        return true;
    }

    public async Task<bool> ToggleActiveAsync(int userId)
    {
        var user = await _userRepo.GetByIdAsync(userId)
            ?? throw new KeyNotFoundException("User không tồn tại");
        user.IsActive = !user.IsActive;
        user.UpdatedAt = DateTime.UtcNow;
        _userRepo.Update(user);
        await _userRepo.SaveChangesAsync();
        return user.IsActive;
    }

    public async Task<IEnumerable<BankAccountDto>> GetBankAccountsAsync(int userId) =>
        await _context.BankAccounts
            .Where(b => b.UserId == userId && !b.IsDeleted)
            .Select(b => new BankAccountDto
            {
                BankAccountId = b.BankAccountId,
                UserId = b.UserId,
                AccountNumber = b.AccountNumber,
                AccountHolderName = b.AccountHolderName,
                BankName = b.BankName,
                BankBranch = b.BankBranch,
                SwiftCode = b.SwiftCode,
                AccountType = b.AccountType,
                IsPrimary = b.IsPrimary,
                IsVerified = b.IsVerified
            }).ToListAsync();

    public async Task<BankAccountDto> AddBankAccountAsync(int userId, CreateBankAccountRequest request)
    {
        if (request.IsPrimary)
        {
            var existing = await _context.BankAccounts.Where(b => b.UserId == userId && b.IsPrimary).ToListAsync();
            existing.ForEach(b => b.IsPrimary = false);
        }

        var account = new BankAccount
        {
            UserId = userId,
            AccountNumber = request.AccountNumber,
            AccountHolderName = request.AccountHolderName,
            BankName = request.BankName,
            BankBranch = request.BankBranch,
            SwiftCode = request.SwiftCode,
            AccountType = request.AccountType,
            IsPrimary = request.IsPrimary
        };

        await _context.BankAccounts.AddAsync(account);
        await _context.SaveChangesAsync();

        return new BankAccountDto
        {
            BankAccountId = account.BankAccountId,
            UserId = account.UserId,
            AccountNumber = account.AccountNumber,
            AccountHolderName = account.AccountHolderName,
            BankName = account.BankName,
            BankBranch = account.BankBranch,
            AccountType = account.AccountType,
            IsPrimary = account.IsPrimary
        };
    }

    public async Task<bool> DeleteBankAccountAsync(int userId, int bankAccountId)
    {
        var account = await _context.BankAccounts
            .FirstOrDefaultAsync(b => b.BankAccountId == bankAccountId && b.UserId == userId)
            ?? throw new KeyNotFoundException("Tài khoản ngân hàng không tồn tại");

        account.IsDeleted = true;
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> SetPrimaryBankAccountAsync(int userId, int bankAccountId)
    {
        var accounts = await _context.BankAccounts.Where(b => b.UserId == userId).ToListAsync();
        accounts.ForEach(b => b.IsPrimary = b.BankAccountId == bankAccountId);
        await _context.SaveChangesAsync();
        return true;
    }

    private static UserDto MapToDto(User u) => new()
    {
        UserId = u.UserId,
        Email = u.Email,
        Phone = u.Phone,
        CountryCode = u.CountryCode,
        FullName = u.FullName,
        AvatarUrl = u.AvatarUrl,
        IsActive = u.IsActive,
        RoleName = u.Role?.RoleName,
        LoginSource = u.LoginSource,
        CreatedAt = u.CreatedAt
    };

    private static UserDetailDto MapDetailToDto(UserDetail d) => new()
    {
        UserDetailId = d.UserDetailId,
        UserId = d.UserId,
        Address = d.Address,
        DateOfBirth = d.DateOfBirth,
        Gender = d.Gender,
        NationalId = d.NationalId,
        NationalIdFrontImage = d.NationalIdFrontImage,
        NationalIdBackImage = d.NationalIdBackImage,
        DrivingLicense = d.DrivingLicense,
        DrivingLicenseFrontImage = d.DrivingLicenseFrontImage,
        DrivingLicenseBackImage = d.DrivingLicenseBackImage,
        IsVerified = d.IsVerified
    };
}
