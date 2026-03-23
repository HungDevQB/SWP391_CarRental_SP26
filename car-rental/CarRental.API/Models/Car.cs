using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CarRental.API.Models;

[Table("Car")]
public class Car
{
    [Key]
    [Column("car_id")]
    public int CarId { get; set; }

    [Column("supplier_id")]
    public int SupplierId { get; set; }

    [Column("brand_id")]
    public int CarBrandId { get; set; }

    [Column("fuel_type_id")]
    public int FuelTypeId { get; set; }

    [Required]
    [MaxLength(100)]
    [Column("model")]
    public string CarModel { get; set; } = string.Empty;

    [MaxLength(20)]
    [Column("license_plate")]
    public string? LicensePlate { get; set; }

    [Column("year")]
    public int? Year { get; set; }

    [Column("num_of_seats")]
    public byte? Seats { get; set; }

    [MaxLength(50)]
    [Column("color")]
    public string? Color { get; set; }

    [MaxLength(20)]
    [Column("transmission")]
    public string? Transmission { get; set; }

    [Column("daily_rate", TypeName = "decimal(15,2)")]
    public decimal RentalPricePerDay { get; set; }

    [MaxLength(2000)]
    [Column("describe")]
    public string? Description { get; set; }

    [MaxLength(2000)]
    [Column("features")]
    public string? Features { get; set; }

    [Column("status_id")]
    public int StatusId { get; set; } = 11; // 11 = available

    [Column("is_deleted")]
    public bool IsDeleted { get; set; } = false;

    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [Column("updated_at")]
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    [Column("region_id")]
    public int? RegionId { get; set; }

    // Navigation
    [ForeignKey("SupplierId")]
    public User? Supplier { get; set; }

    [ForeignKey("CarBrandId")]
    public CarBrand? CarBrand { get; set; }

    [ForeignKey("FuelTypeId")]
    public FuelType? FuelType { get; set; }

    [ForeignKey("RegionId")]
    public Region? Region { get; set; }

    [ForeignKey("StatusId")]
    public Status? Status { get; set; }

    public ICollection<Image> Images { get; set; } = new List<Image>();
    public ICollection<Booking> Bookings { get; set; } = new List<Booking>();
    public ICollection<Maintenance> Maintenances { get; set; } = new List<Maintenance>();
    public ICollection<Insurance> Insurances { get; set; } = new List<Insurance>();
    public ICollection<Favorite> Favorites { get; set; } = new List<Favorite>();
    public ICollection<Rating> Ratings { get; set; } = new List<Rating>();
    public ICollection<SignUpToProvide> SignUpToProvides { get; set; } = new List<SignUpToProvide>();
    public ICollection<CarConditionReport> CarConditionReports { get; set; } = new List<CarConditionReport>();
}
