using System.ComponentModel.DataAnnotations;

namespace CarRental.API.DTOs.Car;

public class DriverDto
{
    public int DriverId { get; set; }
    public int UserId { get; set; }
    public string? DriverName { get; set; }
    public string? AvatarUrl { get; set; }
    public string? LicenseNumber { get; set; }
    public string? LicenseType { get; set; }
    public int? ExperienceYears { get; set; }
    public string? Description { get; set; }
    public string AvailabilityStatus { get; set; } = "available";
    public decimal Rating { get; set; }
}

public class CreateDriverRequest
{
    [Required]
    public int UserId { get; set; }
    public string? LicenseNumber { get; set; }
    public string? LicenseType { get; set; }
    public int? ExperienceYears { get; set; }
    public string? Description { get; set; }
}
