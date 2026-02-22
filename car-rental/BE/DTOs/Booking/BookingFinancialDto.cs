namespace CarRental.API.DTOs.Booking;

public class BookingFinancialDto
{
    public int BookingId { get; set; }
    public decimal DiscountAmount { get; set; }
    public decimal TotalPrice { get; set; }
    public decimal PlatformFee { get; set; }
    public decimal NetAmount { get; set; }
}

public class BookingStatusHistoryDto
{
    public int BookingId { get; set; }
    public string? PreviousStatus { get; set; }
    public string? NewStatus { get; set; }
    public DateTime ChangedAt { get; set; }
    public string? ChangedBy { get; set; }
    public string? Remark { get; set; }
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
