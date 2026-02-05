// Notification entity - real-time user notification model
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CarRental.API.Models;

[Table("Notification")]
public class Notification
{
    [Key]
    [Column("notification_id")]
    public int NotificationId { get; set; }

    [Column("user_id")]
    public int UserId { get; set; }

    [Required]
    [MaxLength(500)]
    [Column("message")]
    public string Message { get; set; } = string.Empty;

    [MaxLength(20)]
    [Column("type")]
    public string Type { get; set; } = "in_app";

    [Column("status_id")]
    public int StatusId { get; set; } = 1;

    [Column("is_deleted")]
    public bool IsDeleted { get; set; } = false;

    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation
    [ForeignKey("UserId")]
    public User? User { get; set; }
}
