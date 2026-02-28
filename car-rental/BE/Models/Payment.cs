// Payment entity - financial transaction records
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CarRental.API.Models;

[Table("Payment")]
public class Payment
{
    [Key]
    [Column("payment_id")]
    public int PaymentId { get; set; }

    [Column("booking_id")]
    public int BookingId { get; set; }

    [Required]
    [Column("amount", TypeName = "decimal(10,2)")]
    public decimal Amount { get; set; }

    [Column("region_id")]
    public int RegionId { get; set; }

    [MaxLength(100)]
    [Column("transaction_id")]
    public string? TransactionId { get; set; }

    [MaxLength(50)]
    [Column("payment_method")]
    public string? PaymentMethod { get; set; }

    [Column("payment_status_id")]
    public int PaymentStatusId { get; set; }

    [Column("payment_date")]
    public DateTime PaymentDate { get; set; } = DateTime.UtcNow;

    [MaxLength(20)]
    [Column("payment_type")]
    public string PaymentType { get; set; } = "deposit";

    [Column("customer_cash_confirmed")]
    public bool? CustomerCashConfirmed { get; set; }

    [Column("customer_cash_confirmed_at")]
    public DateTime? CustomerCashConfirmedAt { get; set; }

    [Column("supplier_cash_confirmed")]
    public bool? SupplierCashConfirmed { get; set; }

    [Column("supplier_cash_confirmed_at")]
    public DateTime? SupplierCashConfirmedAt { get; set; }

    [Column("is_deleted")]
    public bool IsDeleted { get; set; } = false;

    // Properties not in DB — kept for code compatibility
    [NotMapped]
    public string PaymentStatus { get; set; } = "pending";

    [NotMapped]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [NotMapped]
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // Navigation
    [ForeignKey("BookingId")]
    public Booking? Booking { get; set; }

    public CashPaymentConfirmation? CashPaymentConfirmation { get; set; }
}
