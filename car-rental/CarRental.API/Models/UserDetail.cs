using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CarRental.API.Models;

[Table("UserDetail")]
public class UserDetail
{
    [Key]
    [Column("user_id")]
    public int UserId { get; set; }

    [MaxLength(500)]
    [Column("address")]
    public string? Address { get; set; }

    [Column("date_of_birth")]
    public DateTime? DateOfBirth { get; set; }

    [MaxLength(10)]
    [Column("gender")]
    public string? Gender { get; set; }

    [MaxLength(50)]
    [Column("national_id")]
    public string? NationalId { get; set; }

    [MaxLength(500)]
    [Column("national_id_front_image")]
    public string? NationalIdFrontImage { get; set; }

    [MaxLength(500)]
    [Column("national_id_back_image")]
    public string? NationalIdBackImage { get; set; }

    [MaxLength(50)]
    [Column("driving_license")]
    public string? DrivingLicense { get; set; }

    [MaxLength(500)]
    [Column("driving_license_front_image")]
    public string? DrivingLicenseFrontImage { get; set; }

    [MaxLength(500)]
    [Column("driving_license_back_image")]
    public string? DrivingLicenseBackImage { get; set; }

    [MaxLength(500)]
    [Column("avatar")]
    public string? Avatar { get; set; }

    [Column("is_verified")]
    public bool IsVerified { get; set; } = false;

    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [Column("updated_at")]
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // Navigation
    [ForeignKey("UserId")]
    public User? User { get; set; }
}
