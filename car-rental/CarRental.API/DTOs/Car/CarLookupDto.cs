namespace CarRental.API.DTOs.Car;

public class CarBrandDto
{
    public int CarBrandId { get; set; }
    public string BrandName { get; set; } = string.Empty;
}

public class FuelTypeDto
{
    public int FuelTypeId { get; set; }
    public string FuelTypeName { get; set; } = string.Empty;
}

public class RegionDto
{
    public int RegionId { get; set; }
    public string RegionName { get; set; } = string.Empty;
    public string? Currency { get; set; }
    public string? CountryCode { get; set; }
}

public class ImageDto
{
    public int ImageId { get; set; }
    public int CarId { get; set; }
    public string ImageUrl { get; set; } = string.Empty;
    public string? ImageType { get; set; }
}

public class CarYearDto
{
    public int Year { get; set; }
}
