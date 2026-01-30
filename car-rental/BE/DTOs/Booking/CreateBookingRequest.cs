using System.ComponentModel.DataAnnotations;

namespace CarRental.API.DTOs.Booking;

public class CreateBookingRequest
{
    [Required]
    public int CarId { get; set; }

    public int? DriverId { get; set; }

    [Required]
    public DateTime StartDate { get; set; }

    [Required]
    public DateTime EndDate { get; set; }

    public string? PickupLocation { get; set; }
    public string? DropoffLocation { get; set; }
    public string? PaymentMethod { get; set; }
    public string? PromotionCode { get; set; }

    [MaxLength(500)]
    public string? Note { get; set; }
}

public class UpdateBookingStatusRequest
{
    [Required]
    public int StatusId { get; set; }
}
