using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CarRental.API.Models;

[Table("Insurance")]
public class Insurance
{
    [Key]
    [Column("insurance_id")]
    public int InsuranceId { get; set; }

    [Column("car_id")]
    public int CarId { get; set; }

    [MaxLength(100)]
    [Column("insurance_type")]
    public string? InsuranceType { get; set; }

    [MaxLength(100)]
    [Column("insurance_provider")]
    public string? InsuranceProvider { get; set; }

    [MaxLength(100)]
    [Column("insurance_number")]
    public string? InsuranceNumber { get; set; }

    [Column("coverage_amount", TypeName = "decimal(15,2)")]
    public decimal? CoverageAmount { get; set; }

    [Column("premium_amount", TypeName = "decimal(15,2)")]
    public decimal? PremiumAmount { get; set; }

    [Column("start_date")]
    public DateTime? StartDate { get; set; }

    [Column("end_date")]
    public DateTime? EndDate { get; set; }

    [Column("is_deleted")]
    public bool IsDeleted { get; set; } = false;

    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [Column("updated_at")]
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // Navigation
    [ForeignKey("CarId")]
    public Car? Car { get; set; }
}
