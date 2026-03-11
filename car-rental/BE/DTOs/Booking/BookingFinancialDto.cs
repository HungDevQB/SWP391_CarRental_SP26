namespace CarRental.API.DTOs.Booking;

public class BookingFinancialDto
{
    public int BookingId { get; set; }
    public decimal DiscountAmount { get; set; }
    public decimal TotalPrice { get; set; }
}

public class DepositDto
{
    public int DepositId { get; set; }
    public int BookingId { get; set; }
    public decimal DepositAmount { get; set; }
    public string DepositStatus { get; set; } = "pending";
    public DateTime? DepositPaidAt { get; set; }
    public DateTime? DepositRefundedAt { get; set; }
    public decimal? RefundAmount { get; set; }
}
