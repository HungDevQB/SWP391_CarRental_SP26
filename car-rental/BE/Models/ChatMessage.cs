using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CarRental.API.Models;

[Table("ChatMessage")]
public class ChatMessage
{
    [Key]
    [Column("message_id")]
    public int MessageId { get; set; }

    [Column("sender_id")]
    public int SenderId { get; set; }

    [Column("receiver_id")]
    public int ReceiverId { get; set; }

    [MaxLength(2000)]
    [Column("message_text")]
    public string? MessageText { get; set; }

    [Column("sent_at")]
    public DateTime SentAt { get; set; } = DateTime.UtcNow;

    [Column("is_read")]
    public bool IsRead { get; set; } = false;

    [MaxLength(20)]
    [Column("message_type")]
    public string MessageType { get; set; } = "text";

    [Column("is_deleted")]
    public bool IsDeleted { get; set; } = false;

    // Navigation
    [ForeignKey("SenderId")]
    public User? Sender { get; set; }

    [ForeignKey("ReceiverId")]
    public User? Receiver { get; set; }

    public ICollection<ChatMessageImage> ChatMessageImages { get; set; } = new List<ChatMessageImage>();
}
