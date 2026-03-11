using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CarRental.API.Models;

[Table("SupplierRevenue")]
public class SupplierRevenue
{
    [Key]
    [Column("revenue_id")]
    public int RevenueId { get; set; }

    [Column("supplier_id")]
    public int SupplierId { get; set; }

    [Column("booking_id")]
    public int BookingId { get; set; }

    [Column("amount", TypeName = "decimal(10,2)")]
    public decimal Amount { get; set; }

    [Column("region_id")]
    public int RegionId { get; set; }

    [Column("date")]
    public DateTime Date { get; set; } = DateTime.UtcNow;

    [Column("is_deleted")]
    public bool IsDeleted { get; set; } = false;

    // Properties not in DB — kept for code compatibility
    [NotMapped]
    public decimal GrossAmount
    {
        get => Amount;
        set => Amount = value;
    }

    [NotMapped]
    public decimal PlatformFeePercentage { get; set; }

    [NotMapped]
    public decimal PlatformFeeAmount { get; set; }

    [NotMapped]
    public decimal NetAmount { get; set; }

    [NotMapped]
    public string RevenueStatus { get; set; } = "pending";

    [NotMapped]
    public DateTime? PaymentDate { get; set; }

    [NotMapped]
    public string? Notes { get; set; }

    [NotMapped]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [NotMapped]
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // Navigation
    [ForeignKey("BookingId")]
    public Booking? Booking { get; set; }

    [ForeignKey("SupplierId")]
    public User? Supplier { get; set; }
}
