using CarRental.API.Data;
using CarRental.API.DTOs.Common;
using CarRental.API.Models;
using CarRental.API.Services;
using Microsoft.AspNetCore.Mvc;

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

    [HttpPost]
    [Consumes("multipart/form-data")]
    public async Task<IActionResult> Submit(
        string? fullName,
        string? idNumber,
        string? address,
        string? phoneNumber,
        string? email,
        string? password,
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
                Password = password,
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
