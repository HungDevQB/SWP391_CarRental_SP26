namespace CarRental.API.DTOs.Booking;

public class BookingFinancialDto
{
    public int BookingFinancialId { get; set; }
    public int BookingId { get; set; }
    public decimal BasePrice { get; set; }
    public decimal InsuranceFee { get; set; }
    public decimal ServiceFee { get; set; }
    public decimal DriverFee { get; set; }
    public decimal DiscountAmount { get; set; }
    public decimal Subtotal { get; set; }
    public decimal TaxAmount { get; set; }
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

public class ContractDto
{
    public int ContractId { get; set; }
    public int BookingId { get; set; }
    public string? ContractContent { get; set; }
    public bool SignedByCustomer { get; set; }
    public bool SignedBySupplier { get; set; }
    public DateTime CreatedAt { get; set; }
}
