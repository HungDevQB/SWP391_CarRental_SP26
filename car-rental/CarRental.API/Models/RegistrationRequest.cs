using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CarRental.API.Models;

[Table("registration_requests")]
public class RegistrationRequest
{
    [Key]
    [Column("id")]
    public int Id { get; set; }

    [Column("user_id")]
    public int UserId { get; set; }

    [MaxLength(50)]
    [Column("national_id")]
    public string? NationalId { get; set; }

    [MaxLength(500)]
    [Column("national_id_front")]
    public string? NationalIdFront { get; set; }

    [MaxLength(500)]
    [Column("national_id_back")]
    public string? NationalIdBack { get; set; }

    [MaxLength(50)]
    [Column("driving_license")]
    public string? DrivingLicense { get; set; }

    [MaxLength(500)]
    [Column("driving_license_front")]
    public string? DrivingLicenseFront { get; set; }

    [MaxLength(500)]
    [Column("driving_license_back")]
    public string? DrivingLicenseBack { get; set; }

    [Column("is_submitted")]
    public bool IsSubmitted { get; set; } = false;

    [Column("is_approved")]
    public bool IsApproved { get; set; } = false;

    [Column("approved_at")]
    public DateTime? ApprovedAt { get; set; }

    [MaxLength(500)]
    [Column("rejection_reason")]
    public string? RejectionReason { get; set; }

    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [Column("updated_at")]
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    [Column("is_deleted")]
    public bool IsDeleted { get; set; } = false;

    // Navigation
    [ForeignKey("UserId")]
    public User? User { get; set; }
}
