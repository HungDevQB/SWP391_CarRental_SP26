using System.ComponentModel.DataAnnotations;

namespace CarRental.API.DTOs.Auth;

public class RegisterRequest
{
    [Required]
    [EmailAddress]
    public string Email { get; set; } = string.Empty;

    [Required]
    [MinLength(8)]
    public string Password { get; set; } = string.Empty;

    [MaxLength(100)]
    public string? FullName { get; set; }

    public string? Phone { get; set; }
    public string? CountryCode { get; set; }

    // role: customer | supplier (default: customer)
    public string Role { get; set; } = "customer";
}
