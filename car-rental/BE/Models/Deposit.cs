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

    [Column("amount", TypeName = "decimal(10,2)")]
    public decimal Amount { get; set; }

    [Column("region_id")]
    public int RegionId { get; set; }

    [Column("deposit_date")]
    public DateTime DepositDate { get; set; } = DateTime.UtcNow;

    [Column("status_id")]
    public int StatusId { get; set; }

    [Column("refund_amount", TypeName = "decimal(10,2)")]
    public decimal? RefundAmount { get; set; }

    [Column("refund_date")]
    public DateTime? RefundDate { get; set; }

    [Column("is_deleted")]
    public bool IsDeleted { get; set; } = false;

    // Properties not in DB — kept for code compatibility
    [NotMapped]
    public decimal DepositAmount
    {
        get => Amount;
        set => Amount = value;
    }

    [NotMapped]
    public string DepositStatus { get; set; } = "pending";

    [NotMapped]
    public DateTime? DepositPaidAt { get; set; }

    [NotMapped]
    public DateTime? DepositRefundedAt { get; set; }

    [NotMapped]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [NotMapped]
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // Navigation
    [ForeignKey("BookingId")]
    public Booking? Booking { get; set; }
}
