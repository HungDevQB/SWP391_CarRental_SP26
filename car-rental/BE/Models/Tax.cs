using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CarRental.API.Models;

[Table("Tax")]
public class Tax
{
    [Key]
    [Column("tax_id")]
    public int TaxId { get; set; }

    [Required]
    [MaxLength(100)]
    [Column("tax_name")]
    public string TaxName { get; set; } = string.Empty;

    [Required]
    [Column("tax_rate", TypeName = "decimal(5,2)")]
    public decimal TaxRate { get; set; }

    [MaxLength(50)]
    [Column("tax_type")]
    public string? TaxType { get; set; }

    [Column("effective_date")]
    public DateTime? EffectiveDate { get; set; }

    [Column("expiry_date")]
    public DateTime? ExpiryDate { get; set; }

    [MaxLength(500)]
    [Column("description")]
    public string? Description { get; set; }

    [Column("is_active")]
    public bool IsActive { get; set; } = true;

    [Column("is_deleted")]
    public bool IsDeleted { get; set; } = false;

    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [Column("updated_at")]
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // Navigation
    public ICollection<BookingTax> BookingTaxes { get; set; } = new List<BookingTax>();
}
