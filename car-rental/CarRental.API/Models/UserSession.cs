using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CarRental.API.Models;

[Table("user_sessions")]
public class UserSession
{
    [Key]
    [Column("id")]
    public int SessionId { get; set; }

    [Column("user_id")]
    public int UserId { get; set; }

    [Required]
    [MaxLength(1000)]
    [Column("token")]
    public string Token { get; set; } = string.Empty;

    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [Column("expired_at")]
    public DateTime ExpiresAt { get; set; }

    [Column("is_active")]
    public bool IsRevoked { get; set; } = true;

    // Navigation
    [ForeignKey("UserId")]
    public User? User { get; set; }
}
