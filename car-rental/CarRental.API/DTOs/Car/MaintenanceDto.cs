using System.ComponentModel.DataAnnotations;

namespace CarRental.API.DTOs.Car;

public class MaintenanceDto
{
    public int MaintenanceId { get; set; }
    public int CarId { get; set; }
    public string? MaintenanceType { get; set; }
    public string? Description { get; set; }
    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public decimal? Cost { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class CreateMaintenanceRequest
{
    [Required]
    public int CarId { get; set; }
    public string? MaintenanceType { get; set; }
    public string? Description { get; set; }
    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public decimal? Cost { get; set; }
}
