using System.ComponentModel.DataAnnotations;

namespace CarRental.API.DTOs.Booking;

public class CarConditionReportDto
{
    public int ReportId { get; set; }
    public int BookingId { get; set; }
    public int CarId { get; set; }
    public int ReporterId { get; set; }
    public string? ReporterName { get; set; }
    public string ReportType { get; set; } = string.Empty;
    public DateTime ReportDate { get; set; }
    public string? StatusName { get; set; }
    public decimal? FuelLevel { get; set; }
    public int? Mileage { get; set; }
    public string ExteriorCondition { get; set; } = "good";
    public string InteriorCondition { get; set; } = "good";
    public string EngineCondition { get; set; } = "good";
    public string TireCondition { get; set; } = "good";
    public string? DamageNotes { get; set; }
    public string? AdditionalNotes { get; set; }
    public bool IsConfirmed { get; set; }
    public List<string> ImageUrls { get; set; } = new();
}

public class CreateCarConditionReportRequest
{
    [Required]
    public int BookingId { get; set; }

    [Required]
    public int CarId { get; set; }

    [Required]
    public string ReportType { get; set; } = string.Empty; // pickup | return

    public decimal? FuelLevel { get; set; }
    public int? Mileage { get; set; }
    public string ExteriorCondition { get; set; } = "good";
    public string InteriorCondition { get; set; } = "good";
    public string EngineCondition { get; set; } = "good";
    public string TireCondition { get; set; } = "good";
    public string? DamageNotes { get; set; }
    public string? AdditionalNotes { get; set; }
    public List<string>? ImageUrls { get; set; }
}
