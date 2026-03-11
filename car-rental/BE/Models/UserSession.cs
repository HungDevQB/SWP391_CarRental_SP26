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
    [MaxLength(2000)]
    [Column("token")]
    public string Token { get; set; } = string.Empty;

    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [Column("expired_at")]
    public DateTime ExpiresAt { get; set; }

    [Column("is_active")]
    public bool IsActive { get; set; } = true;

    [NotMapped]
    public bool IsRevoked
    {
        get => !IsActive;
        set => IsActive = !value;
    }

    // Navigation
    [ForeignKey("UserId")]
    public User? User { get; set; }
}
