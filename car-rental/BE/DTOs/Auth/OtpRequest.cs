using System.ComponentModel.DataAnnotations;

namespace CarRental.API.DTOs.Auth;

public class SendOtpRequest
{
    [Required]
    public string Phone { get; set; } = string.Empty;
    public string? CountryCode { get; set; }
}

public class VerifyOtpRequest
{
    [Required]
    public string Phone { get; set; } = string.Empty;

    [Required]
    public string Otp { get; set; } = string.Empty;
}

public class SendEmailOtpRequest
{
    [Required]
    [EmailAddress]
    public string Email { get; set; } = string.Empty;
}

public class VerifyEmailOtpRequest
{
    [Required]
    [EmailAddress]
    public string Email { get; set; } = string.Empty;

    [Required]
    public string Otp { get; set; } = string.Empty;
}
