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
    [MaxLength(1000)]
    [Column("message")]
    public string Message { get; set; } = string.Empty;

    [MaxLength(50)]
    [Column("type")]
    public string? Type { get; set; }

    [Column("is_read")]
    public bool IsRead { get; set; } = false;

    [Column("related_entity_id")]
    public int? RelatedEntityId { get; set; }

    [MaxLength(50)]
    [Column("related_entity_type")]
    public string? RelatedEntityType { get; set; }

    [Column("is_deleted")]
    public bool IsDeleted { get; set; } = false;

    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation
    [ForeignKey("UserId")]
    public User? User { get; set; }
}
