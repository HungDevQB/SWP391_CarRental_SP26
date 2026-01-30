namespace CarRental.API.DTOs.Payment;

public class SupplierRevenueDto
{
    public int RevenueId { get; set; }
    public int BookingId { get; set; }
    public int SupplierId { get; set; }
    public string? SupplierName { get; set; }
    public decimal GrossAmount { get; set; }
    public decimal PlatformFeePercentage { get; set; }
    public decimal PlatformFeeAmount { get; set; }
    public decimal NetAmount { get; set; }
    public string RevenueStatus { get; set; } = "pending";
    public DateTime? PaymentDate { get; set; }
    public string? Notes { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class CashPaymentConfirmationDto
{
    public int Id { get; set; }
    public int PaymentId { get; set; }
    public int SupplierId { get; set; }
    public bool IsConfirmed { get; set; }
    public DateTime? ConfirmedAt { get; set; }
    public string? Notes { get; set; }
    public decimal PlatformFee { get; set; }
    public string PlatformFeeStatus { get; set; } = "pending";
    public DateTime? PlatformFeeDueDate { get; set; }
    public decimal PenaltyAmount { get; set; }
    public decimal? TotalAmountDue { get; set; }
}

public class ConfirmCashPaymentRequest
{
    public string? Notes { get; set; }
}
