using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CarRental.API.Models;

[Table("cash_payment_confirmations")]
public class CashPaymentConfirmation
{
    [Key]
    [Column("id")]
    public int Id { get; set; }

    [Column("payment_id")]
    public int PaymentId { get; set; }

    [Column("supplier_id")]
    public int SupplierId { get; set; }

    [Column("is_confirmed")]
    public bool IsConfirmed { get; set; } = false;

    [Column("confirmed_at")]
    public DateTime? ConfirmedAt { get; set; }

    [MaxLength(500)]
    [Column("notes")]
    public string? Notes { get; set; }

    [Required]
    [Column("platform_fee", TypeName = "decimal(15,2)")]
    public decimal PlatformFee { get; set; }

    [MaxLength(20)]
    [Column("platform_fee_status")]
    public string PlatformFeeStatus { get; set; } = "pending";

    [Column("platform_fee_due_date")]
    public DateTime? PlatformFeeDueDate { get; set; }

    [Column("platform_fee_paid_at")]
    public DateTime? PlatformFeePaidAt { get; set; }

    [Column("platform_fee_payment_id")]
    public int? PlatformFeePaymentId { get; set; }

    [Column("overdue_penalty_rate", TypeName = "decimal(5,2)")]
    public decimal OverduePenaltyRate { get; set; } = 0.05m;

    [Column("penalty_amount", TypeName = "decimal(15,2)")]
    public decimal PenaltyAmount { get; set; } = 0;

    [Column("total_amount_due", TypeName = "decimal(15,2)")]
    public decimal? TotalAmountDue { get; set; }

    [Column("overdue_since")]
    public DateTime? OverdueSince { get; set; }

    [Column("escalation_level")]
    public int EscalationLevel { get; set; } = 0;

    [Column("is_deleted")]
    public bool IsDeleted { get; set; } = false;

    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [Column("updated_at")]
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // Navigation
    [ForeignKey("PaymentId")]
    public Payment? Payment { get; set; }

    [ForeignKey("SupplierId")]
    public User? Supplier { get; set; }
}
