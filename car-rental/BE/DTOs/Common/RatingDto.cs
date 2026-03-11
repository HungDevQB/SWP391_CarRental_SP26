namespace CarRental.API.DTOs.Common;

public class RatingDto
{
    public int RatingId { get; set; }
    public int BookingId { get; set; }
    public int CustomerId { get; set; }
    public string? CustomerName { get; set; }
    public int CarId { get; set; }
    public byte RatingScore { get; set; }
    public string? Comment { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class CreateRatingRequest
{
    public int BookingId { get; set; }
    public int CarId { get; set; }
    public byte RatingScore { get; set; }
    public string? Comment { get; set; }
}
