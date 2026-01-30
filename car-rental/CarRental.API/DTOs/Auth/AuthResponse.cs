namespace CarRental.API.DTOs.Auth;

public class AuthResponse
{
    public string Token { get; set; } = string.Empty;
    public string Username { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;
    public long ExpiresAt { get; set; }  // Unix timestamp ms
    public int UserId { get; set; }
    public string? AvatarUrl { get; set; }
    public string? FullName { get; set; }
}
