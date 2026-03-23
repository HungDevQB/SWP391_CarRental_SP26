using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CarRental.API.Models;

[Table("ChatMessageImage")]
public class ChatMessageImage
{
    [Key]
    [Column("image_id")]
    public int ImageId { get; set; }

    [Column("message_id")]
    public int MessageId { get; set; }

    [Required]
    [MaxLength(500)]
    [Column("image_url")]
    public string ImageUrl { get; set; } = string.Empty;

    [Column("is_deleted")]
    public bool IsDeleted { get; set; } = false;

    [Column("upload_date")]
    public DateTime UploadDate { get; set; } = DateTime.UtcNow;

    // Navigation
    [ForeignKey("MessageId")]
    public ChatMessage? ChatMessage { get; set; }
}
