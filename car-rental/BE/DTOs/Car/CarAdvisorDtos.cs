using System.ComponentModel.DataAnnotations;

namespace CarRental.API.DTOs.Car;

public class CarAdvisorMessageDto
{
    [Required]
    public string Role { get; set; } = "user"; // user | assistant

    [Required]
    [MaxLength(4000)]
    public string Content { get; set; } = "";
}

public class CarAdvisorChatRequest
{
    [Required]
    [MinLength(1)]
    public List<CarAdvisorMessageDto> Messages { get; set; } = new();
}

public class CarAdvisorChatResponse
{
    public string Reply { get; set; } = "";
    public List<CarAdvisorCarDto> Cars { get; set; } = new();
    public bool UsedAiModel { get; set; }
}

public class CarAdvisorCarDto
{
    public int CarId { get; set; }
    public string? BrandName { get; set; }
    public string CarModel { get; set; } = "";
    public int? Year { get; set; }
    public int? Seats { get; set; }
    public decimal RentalPricePerDay { get; set; }
    public string? RegionName { get; set; }
    public string? FuelTypeName { get; set; }
    public string? ThumbnailUrl { get; set; }
}
