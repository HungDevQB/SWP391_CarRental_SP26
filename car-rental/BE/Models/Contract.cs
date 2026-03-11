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
    public int? DriverId { get; set; }

    [Column("start_date")]
    public DateOnly StartDate { get; set; }

    [Column("end_date")]
    public DateOnly EndDate { get; set; }

    [Column("terms_and_conditions")]
    public string? TermsAndConditions { get; set; }

    [Column("customer_signature")]
    public string? CustomerSignature { get; set; }

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

    // Computed from terms_and_conditions
    [NotMapped]
    public string? ContractContent => TermsAndConditions;

    // Computed from signatures
    [NotMapped]
    public bool SignedByCustomer => !string.IsNullOrEmpty(CustomerSignature);

    [NotMapped]
    public bool SignedBySupplier => !string.IsNullOrEmpty(SupplierSignature);

    // Navigation
    [ForeignKey("BookingId")]
    public Booking? Booking { get; set; }

    [ForeignKey("ContractStatusId")]
    public Status? ContractStatus { get; set; }

    [ForeignKey("CustomerId")]
    public User? Customer { get; set; }

    [ForeignKey("SupplierId")]
    public User? Supplier { get; set; }

    [ForeignKey("CarId")]
    public Car? Car { get; set; }
}
