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
    [Column("amount", TypeName = "decimal(15,2)")]
    public decimal Amount { get; set; }

    [MaxLength(50)]
    [Column("payment_method")]
    public string? PaymentMethod { get; set; }

    [MaxLength(20)]
    [Column("payment_status")]
    public string PaymentStatus { get; set; } = "pending";

    [MaxLength(255)]
    [Column("transaction_id")]
    public string? TransactionId { get; set; }

    [Column("payment_date")]
    public DateTime? PaymentDate { get; set; }

    [Column("is_deleted")]
    public bool IsDeleted { get; set; } = false;

    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [Column("updated_at")]
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // Navigation
    [ForeignKey("BookingId")]
    public Booking? Booking { get; set; }

    public CashPaymentConfirmation? CashPaymentConfirmation { get; set; }
}
