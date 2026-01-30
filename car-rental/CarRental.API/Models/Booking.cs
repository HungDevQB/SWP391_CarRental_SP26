using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CarRental.API.Models;

[Table("Booking")]
public class Booking
{
    [Key]
    [Column("booking_id")]
    public int BookingId { get; set; }

    [Column("customer_id")]
    public int CustomerId { get; set; }

    [Column("car_id")]
    public int CarId { get; set; }

    [Column("driver_id")]
    public int? DriverId { get; set; }

    [Required]
    [Column("start_date")]
    public DateTime StartDate { get; set; }

    [Required]
    [Column("end_date")]
    public DateTime EndDate { get; set; }

    [MaxLength(500)]
    [Column("pickup_location")]
    public string? PickupLocation { get; set; }

    [MaxLength(500)]
    [Column("dropoff_location")]
    public string? DropoffLocation { get; set; }

    [Column("status_id")]
    public int StatusId { get; set; } = 1;

    [Column("total_price", TypeName = "decimal(15,2)")]
    public decimal TotalPrice { get; set; }

    [Column("promotion_id")]
    public int? PromotionId { get; set; }

    [MaxLength(50)]
    [Column("payment_method")]
    public string? PaymentMethod { get; set; }

    [Column("service_fee", TypeName = "decimal(15,2)")]
    public decimal ServiceFee { get; set; } = 0;

    [Column("is_deleted")]
    public bool IsDeleted { get; set; } = false;

    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [Column("updated_at")]
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    [Column("price_per_day", TypeName = "decimal(15,2)")]
    public decimal PricePerDay { get; set; }

    // Navigation
    [ForeignKey("CustomerId")]
    public User? Customer { get; set; }

    [ForeignKey("CarId")]
    public Car? Car { get; set; }

    [ForeignKey("DriverId")]
    public Driver? Driver { get; set; }

    [ForeignKey("StatusId")]
    public Status? Status { get; set; }

    [ForeignKey("PromotionId")]
    public Promotion? Promotion { get; set; }

    public BookingFinancial? BookingFinancial { get; set; }
    public ICollection<BookingTax> BookingTaxes { get; set; } = new List<BookingTax>();
    public Deposit? Deposit { get; set; }
    public ICollection<Payment> Payments { get; set; } = new List<Payment>();
    public ICollection<Rating> Ratings { get; set; } = new List<Rating>();
    public Cancellation? Cancellation { get; set; }
    public Contract? Contract { get; set; }
    public SupplierRevenue? SupplierRevenue { get; set; }
    public ICollection<CarConditionReport> CarConditionReports { get; set; } = new List<CarConditionReport>();
}
