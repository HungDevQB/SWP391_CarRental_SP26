using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CarRental.API.Models;

[Table("PhoneOtp")]
public class PhoneOtp
{
    [Key]
    [Column("id")]
    public long Id { get; set; }

    [Required]
    [MaxLength(32)]
    [Column("phone")]
    public string Phone { get; set; } = string.Empty;

    [Required]
    [MaxLength(16)]
    [Column("otp")]
    public string Otp { get; set; } = string.Empty;

    [Required]
    [Column("createdAt")]
    public DateTime CreatedAt { get; set; }

    [Required]
    [Column("verified")]
    public bool Verified { get; set; }
}
