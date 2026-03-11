using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CarRental.API.Models;

[Table("CarBrand")]
public class CarBrand
{
    [Key]
    [Column("brand_id")]
    public int CarBrandId { get; set; }

    [Required]
    [MaxLength(100)]
    [Column("brand_name")]
    public string BrandName { get; set; } = string.Empty;

    [MaxLength(50)]
    [Column("country")]
    public string? Country { get; set; }

    [Column("is_deleted")]
    public bool IsDeleted { get; set; } = false;

    // Navigation
    public ICollection<Car> Cars { get; set; } = new List<Car>();
}
