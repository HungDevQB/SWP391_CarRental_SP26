using CarRental.API.DTOs.Auth;

namespace CarRental.API.Services.Interfaces;

public interface IAuthService
{
    Task<AuthResponse> LoginAsync(LoginRequest request);
    Task<AuthResponse> RegisterAsync(RegisterRequest request);
    Task<bool> ChangePasswordAsync(int userId, ChangePasswordRequest request);
    Task<bool> ForgotPasswordAsync(ForgotPasswordRequest request);
    Task<bool> ResetPasswordAsync(ResetPasswordRequest request);
    Task<AuthResponse?> HandleGoogleCallbackAsync(string code);
    Task<bool> LogoutAsync(int userId, string token);
    Task<bool> RevokeTokenAsync(string token);
}
