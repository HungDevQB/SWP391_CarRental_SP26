using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CarRental.API.Models;

[Table("Driver")]
public class Driver
{
    [Key]
    [Column("driver_id")]
    public int DriverId { get; set; }

    [Column("supplier_id")]
    public int SupplierId { get; set; }

    [Required]
    [MaxLength(100)]
    [Column("driver_name")]
    public string DriverName { get; set; } = string.Empty;

    [Column("dob")]
    public DateOnly Dob { get; set; }

    [MaxLength(200)]
    [Column("address")]
    public string Address { get; set; } = string.Empty;

    [MaxLength(20)]
    [Column("phone")]
    public string Phone { get; set; } = string.Empty;

    [MaxLength(4)]
    [Column("country_code")]
    public string CountryCode { get; set; } = string.Empty;

    [MaxLength(20)]
    [Column("license_number")]
    public string? LicenseNumber { get; set; }

    [MaxLength(5)]
    [Column("license_type")]
    public string? LicenseType { get; set; }

    [Column("experience_years")]
    public int? ExperienceYears { get; set; }

    [Column("license_expiry_date")]
    public DateOnly? LicenseExpiryDate { get; set; }

    [Column("status_id")]
    public int? StatusId { get; set; }

    [Column("is_deleted")]
    public bool IsDeleted { get; set; } = false;

    // Properties not in DB — kept for code compatibility
    [NotMapped]
    public int UserId { get; set; }

    [NotMapped]
    public string? Description { get; set; }

    [NotMapped]
    public string AvailabilityStatus { get; set; } = "available";

    [NotMapped]
    public decimal Rating { get; set; } = 0;

    [NotMapped]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [NotMapped]
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // Navigation
    [ForeignKey("SupplierId")]
    public User? User { get; set; }

    public ICollection<Booking> Bookings { get; set; } = new List<Booking>();
}
