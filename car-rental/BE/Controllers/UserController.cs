using CarRental.API.Data;
using CarRental.API.DTOs.Common;
using CarRental.API.DTOs.User;
using CarRental.API.Services;
using CarRental.API.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CarRental.API.Controllers;

[ApiController]
[Route("api/users")]
[Authorize]
public class UserController : ControllerBase
{
    private readonly IUserService _userService;
    private readonly CloudinaryService _cloudinary;
    private readonly ApplicationDbContext _context;
    private int CurrentUserId => int.Parse(User.FindFirst("userId")?.Value ?? "0");

    public UserController(IUserService userService, CloudinaryService cloudinary, ApplicationDbContext context)
    {
        _userService = userService;
        _cloudinary = cloudinary;
        _context = context;
    }

    [HttpGet("me")]
    public async Task<IActionResult> GetMe()
    {
        var user = await _userService.GetByIdAsync(CurrentUserId);
        return user == null
            ? NotFound(ApiResponse<object>.Fail("User không tồn tại", 404))
            : Ok(ApiResponse<UserDto>.Ok(user));
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        var user = await _userService.GetByIdAsync(id);
        return user == null
            ? NotFound(ApiResponse<object>.Fail("User không tồn tại", 404))
            : Ok(ApiResponse<UserDto>.Ok(user));
    }

    [Authorize(Roles = "admin")]
    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] int page = 0, [FromQuery] int size = 10,
        [FromQuery] string? search = null)
    {
        var result = await _userService.GetAllAsync(page, size, search);
        return Ok(ApiResponse<PageResponse<UserListDto>>.Ok(result));
    }

    [HttpPut("me")]
    public async Task<IActionResult> UpdateProfile([FromBody] UpdateProfileRequest request)
    {
        var user = await _userService.UpdateProfileAsync(CurrentUserId, request);
        return Ok(ApiResponse<UserDto?>.Ok(user, "Cập nhật thành công"));
    }

    [HttpGet("me/detail")]
    public async Task<IActionResult> GetDetail()
    {
        var detail = await _userService.GetUserDetailAsync(CurrentUserId);
        return Ok(ApiResponse<UserDetailDto?>.Ok(detail));
    }

    [HttpPut("me/detail")]
    public async Task<IActionResult> UpdateDetail([FromBody] UpdateUserDetailRequest request)
    {
        var detail = await _userService.UpdateUserDetailAsync(CurrentUserId, request);
        return Ok(ApiResponse<UserDetailDto?>.Ok(detail, "Cập nhật thành công"));
    }

    [Authorize(Roles = "admin")]
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        await _userService.DeleteUserAsync(id);
        return Ok(ApiResponse.OkNoData("Xóa user thành công"));
    }

    [Authorize(Roles = "admin")]
    [HttpPatch("{id:int}/toggle-active")]
    public async Task<IActionResult> ToggleActive(int id)
    {
        var isActive = await _userService.ToggleActiveAsync(id);
        return Ok(ApiResponse<bool>.Ok(isActive, isActive ? "Kích hoạt thành công" : "Vô hiệu hóa thành công"));
    }

    // Bank accounts
    [HttpGet("me/bank-accounts")]
    public async Task<IActionResult> GetBankAccounts()
    {
        var accounts = await _userService.GetBankAccountsAsync(CurrentUserId);
        return Ok(ApiResponse<IEnumerable<BankAccountDto>>.Ok(accounts));
    }

    [HttpPost("me/bank-accounts")]
    public async Task<IActionResult> AddBankAccount([FromBody] CreateBankAccountRequest request)
    {
        var account = await _userService.AddBankAccountAsync(CurrentUserId, request);
        return Ok(ApiResponse<BankAccountDto>.Created(account, "Thêm tài khoản thành công"));
    }

    [HttpDelete("me/bank-accounts/{accountId:int}")]
    public async Task<IActionResult> DeleteBankAccount(int accountId)
    {
        await _userService.DeleteBankAccountAsync(CurrentUserId, accountId);
        return Ok(ApiResponse.OkNoData("Xóa tài khoản thành công"));
    }

    [HttpPatch("me/bank-accounts/{accountId:int}/set-primary")]
    public async Task<IActionResult> SetPrimary(int accountId)
    {
        await _userService.SetPrimaryBankAccountAsync(CurrentUserId, accountId);
        return Ok(ApiResponse.OkNoData("Cập nhật thành công"));
    }

    [HttpPost("me/driving-license-image")]
    [Consumes("multipart/form-data")]
    public async Task<IActionResult> UploadDrivingLicenseImage(IFormFile file, [FromQuery] string side)
    {
        if (file == null || file.Length == 0)
            return BadRequest(ApiResponse<object>.Fail("Vui lòng chọn file ảnh"));

        if (file.Length > 5 * 1024 * 1024)
            return BadRequest(ApiResponse<object>.Fail("File quá lớn, tối đa 5MB"));

        var allowedTypes = new[] { "image/jpeg", "image/png", "image/webp", "image/gif" };
        if (!allowedTypes.Contains(file.ContentType.ToLower()))
            return BadRequest(ApiResponse<object>.Fail("Chỉ chấp nhận file ảnh JPG, PNG, WEBP"));

        var url = await _cloudinary.UploadDocumentAsync(file, "driving_licenses");

        var detail = await _context.UserDetails.FirstOrDefaultAsync(d => d.UserId == CurrentUserId);
        if (detail == null)
        {
            detail = new CarRental.API.Models.UserDetail { UserId = CurrentUserId };
            _context.UserDetails.Add(detail);
        }

        if (side == "back")
            detail.DrivingLicenseBackImage = url;
        else
            detail.DrivingLicenseFrontImage = url;

        await _context.SaveChangesAsync();

        return Ok(ApiResponse<object>.Ok(new { imageUrl = url }, "Upload ảnh bằng lái thành công"));
    }

    [HttpPost("me/national-id-image")]
    [Consumes("multipart/form-data")]
    public async Task<IActionResult> UploadNationalIdImage(IFormFile file, [FromQuery] string side)
    {
        if (file == null || file.Length == 0)
            return BadRequest(ApiResponse<object>.Fail("Vui lòng chọn file ảnh"));

        if (file.Length > 5 * 1024 * 1024)
            return BadRequest(ApiResponse<object>.Fail("File quá lớn, tối đa 5MB"));

        var allowedTypes = new[] { "image/jpeg", "image/png", "image/webp", "image/gif" };
        if (!allowedTypes.Contains(file.ContentType.ToLower()))
            return BadRequest(ApiResponse<object>.Fail("Chỉ chấp nhận file ảnh JPG, PNG, WEBP"));

        var url = await _cloudinary.UploadDocumentAsync(file, "national_ids");

        var detail = await _context.UserDetails.FirstOrDefaultAsync(d => d.UserId == CurrentUserId);
        if (detail == null)
        {
            detail = new CarRental.API.Models.UserDetail { UserId = CurrentUserId };
            _context.UserDetails.Add(detail);
        }

        if (side == "back")
            detail.NationalIdBackImage = url;
        else
            detail.NationalIdFrontImage = url;

        await _context.SaveChangesAsync();

        return Ok(ApiResponse<object>.Ok(new { imageUrl = url }, "Upload ảnh CCCD thành công"));
    }

    [HttpPost("me/avatar")]
    [Consumes("multipart/form-data")]
    public async Task<IActionResult> UploadAvatar(IFormFile file)
    {
        if (file == null || file.Length == 0)
            return BadRequest(ApiResponse<object>.Fail("Vui lòng chọn file ảnh"));

        if (file.Length > 5 * 1024 * 1024)
            return BadRequest(ApiResponse<object>.Fail("File quá lớn, tối đa 5MB"));

        var allowedTypes = new[] { "image/jpeg", "image/png", "image/webp", "image/gif" };
        if (!allowedTypes.Contains(file.ContentType.ToLower()))
            return BadRequest(ApiResponse<object>.Fail("Chỉ chấp nhận file ảnh JPG, PNG, WEBP"));

        var url = await _cloudinary.UploadAvatarAsync(file, CurrentUserId);

        var detail = await _context.UserDetails.FirstOrDefaultAsync(d => d.UserId == CurrentUserId);
        if (detail == null)
        {
            detail = new CarRental.API.Models.UserDetail { UserId = CurrentUserId };
            _context.UserDetails.Add(detail);
        }
        detail.Avatar = url;
        await _context.SaveChangesAsync();

        return Ok(ApiResponse<object>.Ok(new { avatarUrl = url }, "Cập nhật avatar thành công"));
    }
}
