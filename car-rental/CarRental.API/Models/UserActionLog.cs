using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CarRental.API.Models;

[Table("UserActionLog")]
public class UserActionLog
{
    [Key]
    [Column("log_id")]
    public int LogId { get; set; }

    [Column("user_id")]
    public int UserId { get; set; }

    [MaxLength(100)]
    [Column("action_type")]
    public string? ActionType { get; set; }

    [MaxLength(100)]
    [Column("entity_type")]
    public string? EntityType { get; set; }

    [Column("entity_id")]
    public int? EntityId { get; set; }

    [MaxLength(2000)]
    [Column("details")]
    public string? Details { get; set; }

    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation
    [ForeignKey("UserId")]
    public User? User { get; set; }
}
