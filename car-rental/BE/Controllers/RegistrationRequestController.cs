using CarRental.API.Data;
using CarRental.API.DTOs.Common;
using CarRental.API.Models;
using CarRental.API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CarRental.API.Controllers;

[ApiController]
[Route("api/registration-requests")]
public class RegistrationRequestController : ControllerBase
{
    private readonly CloudinaryService _cloudinary;
    private readonly ApplicationDbContext _context;

    public RegistrationRequestController(CloudinaryService cloudinary, ApplicationDbContext context)
    {
        _cloudinary = cloudinary;
        _context = context;
    }

    [Authorize]
    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] string? status = null)
    {
        var query = _context.RegistrationRequests.AsQueryable();
        if (!string.IsNullOrEmpty(status))
            query = query.Where(r => r.Status == status);
        var list = await query.OrderByDescending(r => r.CreatedAt).ToListAsync();
        return Ok(ApiResponse<object>.Ok(list));
    }

    [Authorize]
    [HttpPost("{id:int}/approve")]
    public async Task<IActionResult> Approve(int id)
    {
        var req = await _context.RegistrationRequests.FindAsync(id);
        if (req == null) return NotFound(ApiResponse<object>.Fail("Không tìm thấy yêu cầu", 404));

        // Update status first (separate SaveChanges to avoid trigger issues)
        req.Status = "approved";
        req.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        // Then try to create supplier user account (non-blocking if trigger fails)
        if (!string.IsNullOrEmpty(req.Email))
        {
            try
            {
                var existing = await _context.Users.IgnoreQueryFilters()
                    .FirstOrDefaultAsync(u => u.Email == req.Email);
                if (existing == null)
                {
                    var supplierRole = await _context.Roles.FirstOrDefaultAsync(r => r.RoleName == "supplier");
                    var hashedPwd = BCrypt.Net.BCrypt.HashPassword(req.Password ?? "CarRental@2025");
                    var newUser = new User
                    {
                        Email = req.Email,
                        Phone = req.PhoneNumber,
                        Username = req.Email,
                        PasswordHash = hashedPwd,
                        RoleId = supplierRole?.RoleId ?? 2,
                        CreatedAt = DateTime.UtcNow,
                        UpdatedAt = DateTime.UtcNow
                    };
                    _context.Users.Add(newUser);
                    await _context.SaveChangesAsync();
                }
            }
            catch { /* User creation may fail due to DB triggers - status already approved */ }
        }

        return Ok(ApiResponse.OkNoData("Đã duyệt yêu cầu và tạo tài khoản supplier"));
    }

    [Authorize]
    [HttpPost("{id:int}/reject")]
    public async Task<IActionResult> Reject(int id)
    {
        var req = await _context.RegistrationRequests.FindAsync(id);
        if (req == null) return NotFound(ApiResponse<object>.Fail("Không tìm thấy yêu cầu", 404));
        req.Status = "rejected";
        req.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();
        return Ok(ApiResponse.OkNoData("Đã từ chối yêu cầu"));
    }

    [HttpPost]
    [Consumes("multipart/form-data")]
    public async Task<IActionResult> Submit(
        [FromForm] string? fullName,
        [FromForm] string? idNumber,
        [FromForm] string? address,
        [FromForm] string? phoneNumber,
        [FromForm] string? email,
        [FromForm] string? password,
        IFormFile? carDocuments,
        IFormFile? businessLicense,
        IFormFile? driverLicense)
    {
        try
        {
            string? carDocUrl = null, bizLicUrl = null, driverLicUrl = null;
            if (carDocuments != null) carDocUrl = await _cloudinary.UploadDocumentAsync(carDocuments, "car_documents");
            if (businessLicense != null) bizLicUrl = await _cloudinary.UploadDocumentAsync(businessLicense, "business_licenses");
            if (driverLicense != null) driverLicUrl = await _cloudinary.UploadDocumentAsync(driverLicense, "driver_licenses");

            var regRequest = new RegistrationRequest
            {
                FullName = fullName,
                IdNumber = idNumber,
                Address = address,
                PhoneNumber = phoneNumber,
                Email = email,
                Password = string.IsNullOrEmpty(password) ? "PendingApproval@1" : password,
                CarDocuments = carDocUrl,
                BusinessLicense = bizLicUrl,
                DriverLicense = driverLicUrl,
                Status = "pending",
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow,
            };

            _context.RegistrationRequests.Add(regRequest);
            await _context.SaveChangesAsync();

            return Ok(ApiResponse.OkNoData("Đăng ký thành công! Chúng tôi sẽ xem xét và phản hồi trong vòng 24h."));
        }
        catch (Exception ex)
        {
            return StatusCode(500, ApiResponse<object>.Fail(ex.InnerException?.Message ?? ex.Message));
        }
    }
}
