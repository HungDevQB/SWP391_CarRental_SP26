using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CarRental.API.Models;

[Table("Cancellation")]
public class Cancellation
{
    [Key]
    [Column("cancellation_id")]
    public int CancellationId { get; set; }

    [Column("booking_id")]
    public int BookingId { get; set; }

    [Column("cancelled_by")]
    public int CancelledBy { get; set; }

    [MaxLength(1000)]
    [Column("reason")]
    public string? Reason { get; set; }

    [Column("cancellation_date")]
    public DateTime CancellationDate { get; set; } = DateTime.UtcNow;

    [Column("refund_amount", TypeName = "decimal(15,2)")]
    public decimal? RefundAmount { get; set; }

    [MaxLength(20)]
    [Column("refund_status")]
    public string? RefundStatus { get; set; }

    [Column("is_deleted")]
    public bool IsDeleted { get; set; } = false;

    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [Column("updated_at")]
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // Navigation
    [ForeignKey("BookingId")]
    public Booking? Booking { get; set; }

    [ForeignKey("CancelledBy")]
    public User? CancelledByUser { get; set; }
}
