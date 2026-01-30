using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CarRental.API.Models;

[Table("user_sessions")]
public class UserSession
{
    [Key]
    [Column("session_id")]
    public int SessionId { get; set; }

    [Column("user_id")]
    public int UserId { get; set; }

    [Required]
    [MaxLength(1000)]
    [Column("token")]
    public string Token { get; set; } = string.Empty;

    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [Column("expires_at")]
    public DateTime ExpiresAt { get; set; }

    [Column("is_revoked")]
    public bool IsRevoked { get; set; } = false;

    [MaxLength(500)]
    [Column("device_info")]
    public string? DeviceInfo { get; set; }

    [MaxLength(50)]
    [Column("ip_address")]
    public string? IpAddress { get; set; }

    // Navigation
    [ForeignKey("UserId")]
    public User? User { get; set; }
}
