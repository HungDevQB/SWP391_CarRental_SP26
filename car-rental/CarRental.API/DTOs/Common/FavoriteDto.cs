namespace CarRental.API.DTOs.Common;

public class FavoriteDto
{
    public int FavoriteId { get; set; }
    public int UserId { get; set; }
    public int CarId { get; set; }
    public string? CarModel { get; set; }
    public string? CarBrand { get; set; }
    public string? ImageUrl { get; set; }
    public decimal RentalPricePerDay { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class ToggleFavoriteRequest
{
    public int CarId { get; set; }
}
