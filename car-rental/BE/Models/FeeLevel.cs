using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CarRental.API.Models;

[Table("FeeLevel")]
public class FeeLevel
{
    [Key]
    [Column("fee_level_id")]
    public int FeeLevelId { get; set; }

    [Column("min_price", TypeName = "decimal(15,2)")]
    public decimal MinPrice { get; set; }

    [Column("max_price", TypeName = "decimal(15,2)")]
    public decimal MaxPrice { get; set; }

    [Required]
    [Column("fee_percentage", TypeName = "decimal(5,2)")]
    public decimal FeePercentage { get; set; }

    [Column("is_deleted")]
    public bool IsDeleted { get; set; } = false;

    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [Column("updated_at")]
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
