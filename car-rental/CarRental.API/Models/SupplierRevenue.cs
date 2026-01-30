using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CarRental.API.Models;

[Table("SupplierRevenue")]
public class SupplierRevenue
{
    [Key]
    [Column("revenue_id")]
    public int RevenueId { get; set; }

    [Column("booking_id")]
    public int BookingId { get; set; }

    [Column("supplier_id")]
    public int SupplierId { get; set; }

    [Column("gross_amount", TypeName = "decimal(15,2)")]
    public decimal GrossAmount { get; set; }

    [Column("platform_fee_percentage", TypeName = "decimal(5,2)")]
    public decimal PlatformFeePercentage { get; set; }

    [Column("platform_fee_amount", TypeName = "decimal(15,2)")]
    public decimal PlatformFeeAmount { get; set; }

    [Column("net_amount", TypeName = "decimal(15,2)")]
    public decimal NetAmount { get; set; }

    [MaxLength(20)]
    [Column("revenue_status")]
    public string RevenueStatus { get; set; } = "pending";

    [Column("payment_date")]
    public DateTime? PaymentDate { get; set; }

    [MaxLength(500)]
    [Column("notes")]
    public string? Notes { get; set; }

    [Column("is_deleted")]
    public bool IsDeleted { get; set; } = false;

    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [Column("updated_at")]
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // Navigation
    [ForeignKey("BookingId")]
    public Booking? Booking { get; set; }

    [ForeignKey("SupplierId")]
    public User? Supplier { get; set; }
}
