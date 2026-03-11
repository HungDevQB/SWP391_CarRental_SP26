using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CarRental.API.Models;

[Table("Maintenance")]
public class Maintenance
{
    [Key]
    [Column("maintenance_id")]
    public int MaintenanceId { get; set; }

    [Column("car_id")]
    public int CarId { get; set; }

    [MaxLength(100)]
    [Column("maintenance_type")]
    public string? MaintenanceType { get; set; }

    [MaxLength(1000)]
    [Column("description")]
    public string? Description { get; set; }

    [Column("start_date")]
    public DateTime? StartDate { get; set; }

    [Column("end_date")]
    public DateTime? EndDate { get; set; }

    [Column("cost", TypeName = "decimal(15,2)")]
    public decimal? Cost { get; set; }

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
