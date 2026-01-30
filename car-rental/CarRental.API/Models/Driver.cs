using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CarRental.API.Models;

[Table("Driver")]
public class Driver
{
    [Key]
    [Column("driver_id")]
    public int DriverId { get; set; }

    [Column("user_id")]
    public int UserId { get; set; }

    [MaxLength(50)]
    [Column("license_number")]
    public string? LicenseNumber { get; set; }

    [MaxLength(50)]
    [Column("license_type")]
    public string? LicenseType { get; set; }

    [Column("experience_years")]
    public int? ExperienceYears { get; set; }

    [MaxLength(1000)]
    [Column("description")]
    public string? Description { get; set; }

    [MaxLength(20)]
    [Column("availability_status")]
    public string AvailabilityStatus { get; set; } = "available";

    [Column("rating", TypeName = "decimal(3,2)")]
    public decimal Rating { get; set; } = 0;

    [Column("is_deleted")]
    public bool IsDeleted { get; set; } = false;

    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [Column("updated_at")]
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // Navigation
    [ForeignKey("UserId")]
    public User? User { get; set; }

    public ICollection<Booking> Bookings { get; set; } = new List<Booking>();
}
