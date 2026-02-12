using System.ComponentModel.DataAnnotations;

namespace CarRental.API.DTOs.Booking;

public class CancellationDto
{
    public int CancellationId { get; set; }
    public int BookingId { get; set; }
    public int CancelledBy { get; set; }
    public string? CancelledByName { get; set; }
    public string? Reason { get; set; }
    public DateTime CancellationDate { get; set; }
    public decimal? RefundAmount { get; set; }
    public string? RefundStatus { get; set; }
    public DateTime? RefundDeadline { get; set; }
    public bool IsRefundEligible { get; set; }
}

public class CreateCancellationRequest
{
    [Required]
    public int BookingId { get; set; }
    public string? Reason { get; set; }
}
