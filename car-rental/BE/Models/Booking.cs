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

    [MaxLength(200)]
    [Column("pickup_location")]
    public string? PickupLocation { get; set; }

    [MaxLength(200)]
    [Column("dropoff_location")]
    public string? DropoffLocation { get; set; }

    [Column("with_driver")]
    public bool WithDriver { get; set; } = false;

    [Column("booking_date")]
    public DateTime BookingDate { get; set; } = DateTime.UtcNow;

    [Column("supplier_delivery_confirm")]
    public bool SupplierDeliveryConfirm { get; set; } = false;

    [Column("customer_receive_confirm")]
    public bool CustomerReceiveConfirm { get; set; } = false;

    [Column("customer_return_confirm")]
    public bool CustomerReturnConfirm { get; set; } = false;

    [Column("supplier_return_confirm")]
    public bool SupplierReturnConfirm { get; set; } = false;

    [Column("delivery_confirm_time")]
    public DateTime? DeliveryConfirmTime { get; set; }

    [Column("return_confirm_time")]
    public DateTime? ReturnConfirmTime { get; set; }

    [Column("extension_days")]
    public int ExtensionDays { get; set; } = 0;

    [Column("extension_status_id")]
    public int? ExtensionStatusId { get; set; }

    [Column("status_id")]
    public int StatusId { get; set; } = 1;

    [Column("region_id")]
    public int RegionId { get; set; }

    [Column("seat_number")]
    public byte SeatNumber { get; set; } = 1;

    [Column("deposit_amount", TypeName = "decimal(10,2)")]
    public decimal DepositAmount { get; set; } = 0;

    [Column("promo_id")]
    public int? PromotionId { get; set; }

    [Column("is_deleted")]
    public bool IsDeleted { get; set; } = false;

    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [Column("updated_at")]
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // Navigation
    [ForeignKey("CustomerId")]
    public User? Customer { get; set; }

    [ForeignKey("CarId")]
    public Car? Car { get; set; }

    [ForeignKey("DriverId")]
    public Driver? Driver { get; set; }

    [ForeignKey("StatusId")]
    public Status? Status { get; set; }

    [ForeignKey("ExtensionStatusId")]
    public Status? ExtensionStatus { get; set; }

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
