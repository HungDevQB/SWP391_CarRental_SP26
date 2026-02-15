namespace CarRental.API.DTOs.Car;

public class CarDto
{
    public int CarId { get; set; }
    public int SupplierId { get; set; }
    public string? SupplierName { get; set; }
    public int CarBrandId { get; set; }
    public string? BrandName { get; set; }
    public int FuelTypeId { get; set; }
    public string? FuelTypeName { get; set; }
    public string CarModel { get; set; } = string.Empty;
    public string? LicensePlate { get; set; }
    public int? Year { get; set; }
    public int? Seats { get; set; }
    public string? Transmission { get; set; }
    public decimal RentalPricePerDay { get; set; }
    public string? Description { get; set; }
    public string Status { get; set; } = "AVAILABLE";
    public int? RegionId { get; set; }
    public string? RegionName { get; set; }
    public string? Location { get; set; }
    public int NumOfTrip { get; set; }
    public decimal Rating { get; set; }
    public decimal AverageRating { get; set; }
    public List<string> ImageUrls { get; set; } = new();
    public DateTime CreatedAt { get; set; }
}

public class CarListDto
{
    public int CarId { get; set; }
    public string? BrandName { get; set; }
    public string CarModel { get; set; } = string.Empty;
    public int? Year { get; set; }
    public int? Seats { get; set; }
    public string? Transmission { get; set; }
    public decimal RentalPricePerDay { get; set; }
    public string Status { get; set; } = "AVAILABLE";
    public string? Location { get; set; }
    public string? RegionName { get; set; }
    public decimal Rating { get; set; }
    public decimal AverageRating { get; set; }
    public int NumOfTrip { get; set; }
    public string? ThumbnailUrl { get; set; }
    public string? FuelTypeName { get; set; }
}
