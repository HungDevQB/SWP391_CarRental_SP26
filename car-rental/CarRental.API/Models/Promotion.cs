using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CarRental.API.Models;

[Table("Promotion")]
public class Promotion
{
    [Key]
    [Column("promotion_id")]
    public int PromotionId { get; set; }

    [Required]
    [MaxLength(50)]
    [Column("code")]
    public string Code { get; set; } = string.Empty;

    [Column("discount_percentage", TypeName = "decimal(5,2)")]
    public decimal DiscountPercentage { get; set; }

    [Column("max_discount_amount", TypeName = "decimal(15,2)")]
    public decimal? MaxDiscountAmount { get; set; }

    [Column("min_order_value", TypeName = "decimal(15,2)")]
    public decimal? MinOrderValue { get; set; }

    [Column("start_date")]
    public DateTime? StartDate { get; set; }

    [Column("end_date")]
    public DateTime? EndDate { get; set; }

    [Column("usage_limit")]
    public int? UsageLimit { get; set; }

    [Column("used_count")]
    public int UsedCount { get; set; } = 0;

    [Column("is_deleted")]
    public bool IsDeleted { get; set; } = false;

    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [Column("updated_at")]
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // Navigation
    public ICollection<Booking> Bookings { get; set; } = new List<Booking>();
}
