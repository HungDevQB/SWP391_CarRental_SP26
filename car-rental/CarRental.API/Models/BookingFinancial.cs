using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CarRental.API.Models;

[Table("BookingFinancials")]
public class BookingFinancial
{
    [Key]
    [Column("booking_financial_id")]
    public int BookingFinancialId { get; set; }

    [Column("booking_id")]
    public int BookingId { get; set; }

    [Column("base_price", TypeName = "decimal(15,2)")]
    public decimal BasePrice { get; set; }

    [Column("insurance_fee", TypeName = "decimal(15,2)")]
    public decimal InsuranceFee { get; set; } = 0;

    [Column("service_fee", TypeName = "decimal(15,2)")]
    public decimal ServiceFee { get; set; } = 0;

    [Column("driver_fee", TypeName = "decimal(15,2)")]
    public decimal DriverFee { get; set; } = 0;

    [Column("discount_amount", TypeName = "decimal(15,2)")]
    public decimal DiscountAmount { get; set; } = 0;

    [Column("subtotal", TypeName = "decimal(15,2)")]
    public decimal Subtotal { get; set; }

    [Column("tax_amount", TypeName = "decimal(15,2)")]
    public decimal TaxAmount { get; set; } = 0;

    [Column("total_price", TypeName = "decimal(15,2)")]
    public decimal TotalPrice { get; set; }

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
