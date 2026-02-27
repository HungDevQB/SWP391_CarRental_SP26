using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CarRental.API.Models;

[Table("Promotion")]
public class Promotion
{
    [Key]
    [Column("promo_id")]
    public int PromotionId { get; set; }

    [Required]
    [MaxLength(20)]
    [Column("code")]
    public string Code { get; set; } = string.Empty;

    [Column("discount_percentage", TypeName = "decimal(5,2)")]
    public decimal DiscountPercentage { get; set; }

    [Column("start_date")]
    public DateOnly StartDate { get; set; }

    [Column("end_date")]
    public DateOnly EndDate { get; set; }

    [MaxLength(200)]
    [Column("description")]
    public string? Description { get; set; }

    [Column("is_deleted")]
    public bool IsDeleted { get; set; } = false;

    // Properties not in DB — kept for code compatibility
    [NotMapped]
    public decimal? MaxDiscountAmount { get; set; }

    [NotMapped]
    public decimal? MinOrderValue { get; set; }

    [NotMapped]
    public int? UsageLimit { get; set; }

    [NotMapped]
    public int UsedCount { get; set; } = 0;

    [NotMapped]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [NotMapped]
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // Navigation
    public ICollection<Booking> Bookings { get; set; } = new List<Booking>();
}
