using System.ComponentModel.DataAnnotations;

namespace CarRental.API.DTOs.Car;

public class CreateCarRequest
{
    [Required]
    public int CarBrandId { get; set; }

    [Required]
    public int FuelTypeId { get; set; }

    [Required]
    public string CarModel { get; set; } = string.Empty;

    public string? LicensePlate { get; set; }
    public int? Year { get; set; }
    public int? Seats { get; set; }
    public string? Transmission { get; set; }

    [Required]
    [Range(0, double.MaxValue)]
    public decimal RentalPricePerDay { get; set; }

    public string? Description { get; set; }
    public int? RegionId { get; set; }
    public string? Location { get; set; }
    public List<string>? ImageUrls { get; set; }
}

public class UpdateCarRequest
{
    public int? CarBrandId { get; set; }
    public int? FuelTypeId { get; set; }
    public string? CarModel { get; set; }
    public string? LicensePlate { get; set; }
    public int? Year { get; set; }
    public int? Seats { get; set; }
    public string? Transmission { get; set; }
    public decimal? RentalPricePerDay { get; set; }
    public string? Description { get; set; }
    public int? RegionId { get; set; }
    public string? Location { get; set; }
    public string? Status { get; set; }
    public List<string>? ImageUrls { get; set; }
}

public class CarSearchRequest
{
    public int? RegionId { get; set; }
    public string? Location { get; set; }
    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    /// <summary>Alias từ query frontend (pickupDateTime) — map sang khoảng thời gian trùng StartDate/EndDate.</summary>
    public DateTime? PickupDateTime { get; set; }
    /// <summary>Alias từ query frontend (dropoffDateTime).</summary>
    public DateTime? DropoffDateTime { get; set; }
    public int? Seats { get; set; }
    public string? Transmission { get; set; }
    public int? FuelTypeId { get; set; }
    public int? CarBrandId { get; set; }
    public decimal? MinPrice { get; set; }
    public decimal? MaxPrice { get; set; }
    public int? Year { get; set; }
    public string? SortBy { get; set; }
    public string? SortDir { get; set; }
    public int Page { get; set; } = 0;
    public int Size { get; set; } = 10;
    public string? Keyword { get; set; }
}
