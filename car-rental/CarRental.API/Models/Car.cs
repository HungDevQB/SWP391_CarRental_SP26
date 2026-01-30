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

    [Column("car_brand_id")]
    public int CarBrandId { get; set; }

    [Column("fuel_type_id")]
    public int FuelTypeId { get; set; }

    [Required]
    [MaxLength(100)]
    [Column("car_model")]
    public string CarModel { get; set; } = string.Empty;

    [MaxLength(20)]
    [Column("license_plate")]
    public string? LicensePlate { get; set; }

    [Column("year")]
    public int? Year { get; set; }

    [Column("seats")]
    public int? Seats { get; set; }

    [MaxLength(20)]
    [Column("transmission")]
    public string? Transmission { get; set; }

    [Column("rental_price_per_day", TypeName = "decimal(15,2)")]
    public decimal RentalPricePerDay { get; set; }

    [MaxLength(2000)]
    [Column("description")]
    public string? Description { get; set; }

    [MaxLength(20)]
    [Column("status")]
    public string Status { get; set; } = "AVAILABLE";

    [Column("is_deleted")]
    public bool IsDeleted { get; set; } = false;

    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [Column("updated_at")]
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    [Column("region_id")]
    public int? RegionId { get; set; }

    [MaxLength(500)]
    [Column("location")]
    public string? Location { get; set; }

    [Column("num_of_trip")]
    public int NumOfTrip { get; set; } = 0;

    [Column("rating", TypeName = "decimal(3,2)")]
    public decimal Rating { get; set; } = 0;

    // Navigation
    [ForeignKey("SupplierId")]
    public User? Supplier { get; set; }

    [ForeignKey("CarBrandId")]
    public CarBrand? CarBrand { get; set; }

    [ForeignKey("FuelTypeId")]
    public FuelType? FuelType { get; set; }

    [ForeignKey("RegionId")]
    public Region? Region { get; set; }

    public ICollection<Image> Images { get; set; } = new List<Image>();
    public ICollection<Booking> Bookings { get; set; } = new List<Booking>();
    public ICollection<Maintenance> Maintenances { get; set; } = new List<Maintenance>();
    public ICollection<Insurance> Insurances { get; set; } = new List<Insurance>();
    public ICollection<Favorite> Favorites { get; set; } = new List<Favorite>();
    public ICollection<Rating> Ratings { get; set; } = new List<Rating>();
    public ICollection<SignUpToProvide> SignUpToProvides { get; set; } = new List<SignUpToProvide>();
    public ICollection<CarConditionReport> CarConditionReports { get; set; } = new List<CarConditionReport>();
}
