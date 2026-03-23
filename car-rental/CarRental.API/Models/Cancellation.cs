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

    [MaxLength(500)]
    [Column("reason")]
    public string? Reason { get; set; }

    [Column("cancellation_date")]
    public DateTime CancellationDate { get; set; } = DateTime.UtcNow;

    [Column("refund_amount", TypeName = "decimal(10,2)")]
    public decimal? RefundAmount { get; set; }

    [Column("region_id")]
    public int? RegionId { get; set; }

    [Column("status_id")]
    public int StatusId { get; set; }

    [Column("is_deleted")]
    public bool IsDeleted { get; set; } = false;

    // Properties not in DB — kept for code compatibility
    [NotMapped]
    public int CancelledBy { get; set; }

    [NotMapped]
    public string? RefundStatus { get; set; }

    [NotMapped]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [NotMapped]
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // Navigation
    [ForeignKey("BookingId")]
    public Booking? Booking { get; set; }

    [NotMapped]
    public User? CancelledByUser { get; set; }
}
