using System.Security.Claims;
using CarRental.API.DTOs.Auth;
using CarRental.API.DTOs.Common;
using CarRental.API.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Caching.Memory;

namespace CarRental.API.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;
    private readonly IEmailService _emailService;
    private readonly IMemoryCache _cache;

    public AuthController(IAuthService authService, IEmailService emailService, IMemoryCache cache)
    {
        _authService = authService;
        _emailService = emailService;
        _cache = cache;
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        try
        {
            var result = await _authService.LoginAsync(request);
            return Ok(ApiResponse<AuthResponse>.Ok(result, "Đăng nhập thành công"));
        }
        catch (UnauthorizedAccessException ex)
        {
            return Unauthorized(ApiResponse<object>.Fail(ex.Message, 401));
        }
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterRequest request)
    {
        try
        {
            var result = await _authService.RegisterAsync(request);
            return Ok(ApiResponse<AuthResponse>.Created(result, "Đăng ký thành công"));
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ApiResponse<object>.Fail(ex.Message));
        }
    }

    [Authorize]
    [HttpPost("logout")]
    public async Task<IActionResult> Logout()
    {
        var userId = int.Parse(User.FindFirst("userId")?.Value ?? "0");
        var token = Request.Headers["Authorization"].ToString().Replace("Bearer ", "");
        await _authService.LogoutAsync(userId, token);
        return Ok(ApiResponse.OkNoData("Đăng xuất thành công"));
    }

    [Authorize]
    [HttpPost("change-password")]
    public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordRequest request)
    {
        try
        {
            var userId = int.Parse(User.FindFirst("userId")?.Value ?? "0");
            await _authService.ChangePasswordAsync(userId, request);
            return Ok(ApiResponse.OkNoData("Đổi mật khẩu thành công"));
        }
        catch (UnauthorizedAccessException ex)
        {
            return BadRequest(ApiResponse<object>.Fail(ex.Message));
        }
    }

    [HttpPost("forgot-password")]
    public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordRequest request)
    {
        await _authService.ForgotPasswordAsync(request);
        return Ok(ApiResponse.OkNoData("Email đặt lại mật khẩu đã được gửi"));
    }

    [HttpPost("reset-password")]
    public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordRequest request)
    {
        try
        {
            await _authService.ResetPasswordAsync(request);
            return Ok(ApiResponse.OkNoData("Đặt lại mật khẩu thành công"));
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ApiResponse<object>.Fail(ex.Message));
        }
    }

    [HttpPost("send-email-otp")]
    public async Task<IActionResult> SendEmailOtp([FromBody] SendEmailOtpRequest request)
    {
        var otp = new Random().Next(100000, 999999).ToString();
        var cacheKey = $"email_otp_{request.Email}";
        _cache.Set(cacheKey, otp, TimeSpan.FromMinutes(5));
        await _emailService.SendOtpAsync(request.Email, otp);
        return Ok(ApiResponse.OkNoData("Mã OTP đã được gửi vào email"));
    }

    [HttpPost("verify-email-otp")]
    public IActionResult VerifyEmailOtp([FromBody] VerifyEmailOtpRequest request)
    {
        var cacheKey = $"email_otp_{request.Email}";
        if (_cache.TryGetValue(cacheKey, out string? storedOtp) && storedOtp == request.Otp)
        {
            _cache.Remove(cacheKey);
            return Ok(ApiResponse.OkNoData("Xác thực OTP thành công"));
        }
        return BadRequest(ApiResponse<object>.Fail("Mã OTP không đúng hoặc đã hết hạn"));
    }
}
