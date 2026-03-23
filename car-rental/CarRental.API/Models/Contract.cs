using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CarRental.API.Models;

[Table("Contract")]
public class Contract
{
    [Key]
    [Column("contract_id")]
    public int ContractId { get; set; }

    [Column("booking_id")]
    public int BookingId { get; set; }

    [Required]
    [MaxLength(50)]
    [Column("contract_code")]
    public string ContractCode { get; set; } = string.Empty;

    [Column("customer_id")]
    public int CustomerId { get; set; }

    [Column("supplier_id")]
    public int SupplierId { get; set; }

    [Column("car_id")]
    public int CarId { get; set; }

    [Column("driver_id")]
    public int DriverId { get; set; }

    [Column("start_date")]
    public DateOnly StartDate { get; set; }

    [Column("end_date")]
    public DateOnly EndDate { get; set; }

    [Column("terms_and_conditions")]
    public string? TermsAndConditions { get; set; }

    [MaxLength(255)]
    [Column("customer_signature")]
    public string? CustomerSignature { get; set; }

    [MaxLength(255)]
    [Column("supplier_signature")]
    public string? SupplierSignature { get; set; }

    [Column("contract_status_id")]
    public int ContractStatusId { get; set; }

    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [Column("updated_at")]
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    [Column("is_deleted")]
    public bool IsDeleted { get; set; } = false;

    // Properties not in DB — kept for code compatibility
    [NotMapped]
    public string? ContractContent { get; set; }

    [NotMapped]
    public bool SignedByCustomer { get; set; } = false;

    [NotMapped]
    public bool SignedBySupplier { get; set; } = false;

    // Navigation
    [ForeignKey("BookingId")]
    public Booking? Booking { get; set; }
}
