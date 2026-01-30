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

    [Column("contract_content")]
    public string? ContractContent { get; set; }

    [Column("signed_by_customer")]
    public bool SignedByCustomer { get; set; } = false;

    [Column("signed_by_supplier")]
    public bool SignedBySupplier { get; set; } = false;

    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [Column("updated_at")]
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    [Column("is_deleted")]
    public bool IsDeleted { get; set; } = false;

    // Navigation
    [ForeignKey("BookingId")]
    public Booking? Booking { get; set; }
}
