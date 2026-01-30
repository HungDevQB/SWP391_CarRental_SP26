using System.ComponentModel.DataAnnotations;

namespace CarRental.API.DTOs.Payment;

public class PaymentDto
{
    public int PaymentId { get; set; }
    public int BookingId { get; set; }
    public decimal Amount { get; set; }
    public string? PaymentMethod { get; set; }
    public string PaymentStatus { get; set; } = "pending";
    public string? TransactionId { get; set; }
    public DateTime? PaymentDate { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class CreatePaymentRequest
{
    [Required]
    public int BookingId { get; set; }

    [Required]
    public decimal Amount { get; set; }

    [Required]
    public string PaymentMethod { get; set; } = string.Empty;
}

public class VNPayCallbackRequest
{
    public string? vnp_TxnRef { get; set; }
    public string? vnp_Amount { get; set; }
    public string? vnp_ResponseCode { get; set; }
    public string? vnp_TransactionNo { get; set; }
    public string? vnp_SecureHash { get; set; }
    public string? vnp_OrderInfo { get; set; }
    public string? vnp_PayDate { get; set; }
    public string? vnp_BankCode { get; set; }
    public string? vnp_CardType { get; set; }
    public string? vnp_TransactionStatus { get; set; }
}

public class MoMoCallbackRequest
{
    public string? OrderId { get; set; }
    public string? RequestId { get; set; }
    public long Amount { get; set; }
    public string? OrderInfo { get; set; }
    public string? OrderType { get; set; }
    public long TransId { get; set; }
    public int ResultCode { get; set; }
    public string? Message { get; set; }
    public string? Signature { get; set; }
}
