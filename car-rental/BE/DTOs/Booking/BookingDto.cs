namespace CarRental.API.DTOs.Booking;

public class BookingDto
{
    public int BookingId { get; set; }
    public int CustomerId { get; set; }
    public string? CustomerName { get; set; }
    public int CarId { get; set; }
    public string? CarModel { get; set; }
    public string? CarBrand { get; set; }
    public string? CarThumbnail { get; set; }
    public int? DriverId { get; set; }
    public string? DriverName { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public string? PickupLocation { get; set; }
    public string? DropoffLocation { get; set; }
    public string? StatusName { get; set; }
    public int StatusId { get; set; }
    public decimal TotalPrice { get; set; }
    public decimal PricePerDay { get; set; }
    public decimal ServiceFee { get; set; }
    public string? PaymentMethod { get; set; }
    public int? PromotionId { get; set; }
    public string? PromotionCode { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class BookingListDto
{
    public int BookingId { get; set; }
    public string? CarModel { get; set; }
    public string? CarBrand { get; set; }
    public string? CarThumbnail { get; set; }
    public string? CustomerName { get; set; }
    public string? CustomerEmail { get; set; }
    public string? LicensePlate { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public decimal TotalPrice { get; set; }
    public string? StatusName { get; set; }
    public int StatusId { get; set; }
    public DateTime CreatedAt { get; set; }
}
