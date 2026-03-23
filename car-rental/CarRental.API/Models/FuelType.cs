using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CarRental.API.Models;

[Table("FuelType")]
public class FuelType
{
    [Key]
    [Column("fuel_type_id")]
    public int FuelTypeId { get; set; }

    [Required]
    [MaxLength(50)]
    [Column("fuel_type_name")]
    public string FuelTypeName { get; set; } = string.Empty;

    [Column("is_deleted")]
    public bool IsDeleted { get; set; } = false;

    // Navigation
    public ICollection<Car> Cars { get; set; } = new List<Car>();
}
