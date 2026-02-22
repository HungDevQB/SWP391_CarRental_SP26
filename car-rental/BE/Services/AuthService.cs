// AuthService - login, register, OTP and Google OAuth logic
using CarRental.API.Data;
using CarRental.API.DTOs.Auth;
using CarRental.API.Models;
using CarRental.API.Repositories.Interfaces;
using CarRental.API.Security;
using CarRental.API.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace CarRental.API.Services;

public class AuthService : IAuthService
{
    private readonly IUserRepository _userRepo;
    private readonly ApplicationDbContext _context;
    private readonly JwtService _jwt;
    private readonly IEmailService _emailService;

    public AuthService(IUserRepository userRepo, ApplicationDbContext context,
        JwtService jwt, IEmailService emailService)
    {
        _userRepo = userRepo;
        _context = context;
        _jwt = jwt;
        _emailService = emailService;
    }

    public async Task<AuthResponse> LoginAsync(LoginRequest request)
    {
        var user = await _userRepo.GetByEmailAsync(request.Email)
            ?? throw new UnauthorizedAccessException("Email hoặc mật khẩu không đúng");

        if (!user.IsActive)
            throw new UnauthorizedAccessException("Tài khoản đã bị khóa");

        if (user.PasswordHash == null || !BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
            throw new UnauthorizedAccessException("Email hoặc mật khẩu không đúng");

        var role = user.Role?.RoleName ?? "customer";
        var token = _jwt.GenerateToken(user.UserId, user.Email, role);

        // Save session
        await SaveSessionAsync(user.UserId, token);

        return BuildAuthResponse(user, token, role);
    }

    public async Task<AuthResponse> RegisterAsync(RegisterRequest request)
    {
        if (await _userRepo.EmailExistsAsync(request.Email))
            throw new InvalidOperationException("Email đã được sử dụng");

        var roleName = request.Role.ToLower() == "supplier" ? "supplier" : "customer";
        var role = await _context.Roles.FirstOrDefaultAsync(r => r.RoleName == roleName)
            ?? throw new InvalidOperationException("Role không hợp lệ");

        var user = new User
        {
            Username = request.Email, // Use email as username since DB requires it
            Email = request.Email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
            FullName = request.FullName,
            Phone = request.Phone ?? string.Empty,
            CountryCode = request.CountryCode ?? "+84",
            RoleId = role.RoleId,
            StatusId = 1,
            LoginSource = "local",
            IsActive = true
        };

        await _userRepo.AddAsync(user);
        await _userRepo.SaveChangesAsync();

        // Create empty user detail
        await _context.UserDetails.AddAsync(new UserDetail { UserId = user.UserId });
        await _context.SaveChangesAsync();

        var token = _jwt.GenerateToken(user.UserId, user.Email, roleName);
        await SaveSessionAsync(user.UserId, token);

        return BuildAuthResponse(user, token, roleName);
    }

    public async Task<bool> ChangePasswordAsync(int userId, ChangePasswordRequest request)
    {
        var user = await _userRepo.GetByIdAsync(userId)
            ?? throw new KeyNotFoundException("Không tìm thấy user");

        if (user.PasswordHash == null || !BCrypt.Net.BCrypt.Verify(request.CurrentPassword, user.PasswordHash))
            throw new UnauthorizedAccessException("Mật khẩu hiện tại không đúng");

        user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.NewPassword);
        user.UpdatedAt = DateTime.UtcNow;
        _userRepo.Update(user);
        await _userRepo.SaveChangesAsync();
        return true;
    }

    public async Task<bool> ForgotPasswordAsync(ForgotPasswordRequest request)
    {
        var user = await _userRepo.GetByEmailAsync(request.Email);
        if (user == null) return true; // Don't reveal user existence

        var resetToken = Guid.NewGuid().ToString("N");
        // Store token in system config or dedicated table (simplified here)
        await _context.SystemConfigurations.AddAsync(new SystemConfiguration
        {
            ConfigKey = $"pwd_reset_{user.UserId}",
            ConfigValue = resetToken,
            LastUpdated = DateTime.UtcNow
        });
        await _context.SaveChangesAsync();

        await _emailService.SendPasswordResetAsync(user.Email, user.FullName ?? user.Email, resetToken);
        return true;
    }

    public async Task<bool> ResetPasswordAsync(ResetPasswordRequest request)
    {
        var config = await _context.SystemConfigurations
            .FirstOrDefaultAsync(c => c.ConfigValue == request.Token && c.ConfigKey.StartsWith("pwd_reset_"));

        if (config == null) throw new InvalidOperationException("Token không hợp lệ hoặc đã hết hạn");

        var userId = int.Parse(config.ConfigKey.Replace("pwd_reset_", ""));
        var user = await _userRepo.GetByIdAsync(userId)
            ?? throw new KeyNotFoundException("User không tồn tại");

        user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.NewPassword);
        user.UpdatedAt = DateTime.UtcNow;
        _userRepo.Update(user);
        _context.SystemConfigurations.Remove(config);
        await _userRepo.SaveChangesAsync();
        return true;
    }

    public async Task<AuthResponse?> HandleGoogleCallbackAsync(string code)
    {
        // Google OAuth handled by ASP.NET Core middleware
        // This method is called after middleware processes the code
        throw new NotImplementedException("Handled by OAuth middleware");
    }

    public async Task<bool> LogoutAsync(int userId, string token)
    {
        var session = await _context.UserSessions
            .FirstOrDefaultAsync(s => s.UserId == userId && s.Token == token && !s.IsRevoked);

        if (session != null)
        {
            session.IsRevoked = true;
            await _context.SaveChangesAsync();
        }
        return true;
    }

    public async Task<bool> RevokeTokenAsync(string token)
    {
        var session = await _context.UserSessions
            .FirstOrDefaultAsync(s => s.Token == token && !s.IsRevoked);

        if (session != null)
        {
            session.IsRevoked = true;
            await _context.SaveChangesAsync();
        }
        return true;
    }

    private async Task SaveSessionAsync(int userId, string token)
    {
        var session = new UserSession
        {
            UserId = userId,
            Token = token,
            ExpiresAt = DateTime.UtcNow.AddHours(24),
            CreatedAt = DateTime.UtcNow
        };
        await _context.UserSessions.AddAsync(session);
        await _context.SaveChangesAsync();
    }

    private AuthResponse BuildAuthResponse(User user, string token, string role) => new()
    {
        Token = token,
        Username = user.Email,
        Role = role,
        ExpiresAt = _jwt.GetExpiresAtMs(),
        UserId = user.UserId,
        AvatarUrl = user.AvatarUrl,
        FullName = user.FullName
    };
}
