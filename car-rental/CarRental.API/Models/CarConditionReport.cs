using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CarRental.API.Models;

[Table("CarConditionReport")]
public class CarConditionReport
{
    [Key]
    [Column("report_id")]
    public int ReportId { get; set; }

    [Column("booking_id")]
    public int BookingId { get; set; }

    [Column("car_id")]
    public int CarId { get; set; }

    [Column("reporter_id")]
    public int ReporterId { get; set; }

    [Required]
    [MaxLength(20)]
    [Column("report_type")]
    public string ReportType { get; set; } = string.Empty; // pickup | return

    [Column("report_date")]
    public DateTime ReportDate { get; set; } = DateTime.UtcNow;

    [Column("status_id")]
    public int StatusId { get; set; } = 1;

    [Column("fuel_level", TypeName = "decimal(5,2)")]
    public decimal? FuelLevel { get; set; }

    [Column("mileage")]
    public int? Mileage { get; set; }

    [MaxLength(20)]
    [Column("exterior_condition")]
    public string ExteriorCondition { get; set; } = "good";

    [MaxLength(20)]
    [Column("interior_condition")]
    public string InteriorCondition { get; set; } = "good";

    [MaxLength(20)]
    [Column("engine_condition")]
    public string EngineCondition { get; set; } = "good";

    [MaxLength(20)]
    [Column("tire_condition")]
    public string TireCondition { get; set; } = "good";

    [MaxLength(1000)]
    [Column("damage_notes")]
    public string? DamageNotes { get; set; }

    [MaxLength(500)]
    [Column("additional_notes")]
    public string? AdditionalNotes { get; set; }

    [Column("is_confirmed")]
    public bool IsConfirmed { get; set; } = false;

    [Column("confirmed_by")]
    public int? ConfirmedBy { get; set; }

    [Column("confirmed_at")]
    public DateTime? ConfirmedAt { get; set; }

    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [Column("updated_at")]
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    [Column("is_deleted")]
    public bool IsDeleted { get; set; } = false;

    // Navigation
    [ForeignKey("BookingId")]
    public Booking? Booking { get; set; }

    [ForeignKey("CarId")]
    public Car? Car { get; set; }

    [ForeignKey("ReporterId")]
    public User? Reporter { get; set; }

    [ForeignKey("ConfirmedBy")]
    public User? ConfirmedByUser { get; set; }

    [ForeignKey("StatusId")]
    public Status? Status { get; set; }

    public ICollection<CarConditionImage> CarConditionImages { get; set; } = new List<CarConditionImage>();
}
