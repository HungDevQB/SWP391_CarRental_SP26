namespace CarRental.API.DTOs.User;

public class UserDto
{
    public int UserId { get; set; }
    public string Email { get; set; } = string.Empty;
    public string? Phone { get; set; }
    public string? CountryCode { get; set; }
    public string? FullName { get; set; }
    public string? AvatarUrl { get; set; }
    public bool IsActive { get; set; }
    public string? RoleName { get; set; }
    public string? LoginSource { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class UserListDto
{
    public int UserId { get; set; }
    public string Email { get; set; } = string.Empty;
    public string? FullName { get; set; }
    public string? AvatarUrl { get; set; }
    public string? RoleName { get; set; }
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
}
