using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CarRental.API.Models;

[Table("BookingTax")]
public class BookingTax
{
    [Key]
    [Column("booking_tax_id")]
    public int BookingTaxId { get; set; }

    [Column("booking_id")]
    public int BookingId { get; set; }

    [Column("tax_id")]
    public int TaxId { get; set; }

    [Column("taxable_amount", TypeName = "decimal(15,2)")]
    public decimal TaxableAmount { get; set; }

    [Column("tax_amount", TypeName = "decimal(15,2)")]
    public decimal TaxAmount { get; set; }

    [Column("is_deleted")]
    public bool IsDeleted { get; set; } = false;

    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [Column("applied_at")]
    public DateTime? AppliedAt { get; set; }

    // Navigation
    [ForeignKey("BookingId")]
    public Booking? Booking { get; set; }

    [ForeignKey("TaxId")]
    public Tax? Tax { get; set; }
}
