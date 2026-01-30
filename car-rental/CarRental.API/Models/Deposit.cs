using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CarRental.API.Models;

[Table("Deposit")]
public class Deposit
{
    [Key]
    [Column("deposit_id")]
    public int DepositId { get; set; }

    [Column("booking_id")]
    public int BookingId { get; set; }

    [Column("deposit_amount", TypeName = "decimal(15,2)")]
    public decimal DepositAmount { get; set; }

    [MaxLength(20)]
    [Column("deposit_status")]
    public string DepositStatus { get; set; } = "pending";

    [Column("deposit_paid_at")]
    public DateTime? DepositPaidAt { get; set; }

    [Column("deposit_refunded_at")]
    public DateTime? DepositRefundedAt { get; set; }

    [Column("refund_amount", TypeName = "decimal(15,2)")]
    public decimal? RefundAmount { get; set; }

    [Column("is_deleted")]
    public bool IsDeleted { get; set; } = false;

    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [Column("updated_at")]
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // Navigation
    [ForeignKey("BookingId")]
    public Booking? Booking { get; set; }
}
