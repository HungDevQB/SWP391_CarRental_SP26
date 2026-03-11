using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CarRental.API.Models;

[Table("BookingFinancials")]
public class BookingFinancial
{
    [Key]
    [Column("booking_id")]
    public int BookingId { get; set; }

    [Column("total_fare", TypeName = "decimal(10,2)")]
    public decimal TotalFare { get; set; }

    [Column("applied_discount", TypeName = "decimal(10,2)")]
    public decimal AppliedDiscount { get; set; } = 0;

    [Column("late_fee_amount", TypeName = "decimal(10,2)")]
    public decimal LateFeeAmount { get; set; } = 0;

    [Column("late_days")]
    public int LateDays { get; set; } = 0;

    [Column("is_deleted")]
    public bool IsDeleted { get; set; } = false;

    // Navigation
    [ForeignKey("BookingId")]
    public Booking? Booking { get; set; }
}
