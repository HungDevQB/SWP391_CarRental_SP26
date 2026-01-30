using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CarRental.API.Models;

[Table("Region")]
public class Region
{
    [Key]
    [Column("region_id")]
    public int RegionId { get; set; }

    [Required]
    [MaxLength(100)]
    [Column("region_name")]
    public string RegionName { get; set; } = string.Empty;

    [MaxLength(10)]
    [Column("currency")]
    public string? Currency { get; set; }

    [MaxLength(10)]
    [Column("country_code")]
    public string? CountryCode { get; set; }

    [Column("is_deleted")]
    public bool IsDeleted { get; set; } = false;

    // Navigation
    public ICollection<Car> Cars { get; set; } = new List<Car>();
}
