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

public class AdminPaymentDto
{
    public int PaymentId { get; set; }
    public int BookingId { get; set; }
    public string? CustomerName { get; set; }
    public string? SupplierName { get; set; }
    public decimal Amount { get; set; }
    public string? PaymentMethod { get; set; }
    public string? PaymentType { get; set; }
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

public class StripePaymentIntentDto
{
    public string ClientSecret { get; set; } = string.Empty;
    public string PaymentIntentId { get; set; } = string.Empty;
    public long Amount { get; set; }
    public string Currency { get; set; } = "usd";
}

public class CreateStripePaymentRequest
{
    public int BookingId { get; set; }
    public decimal Amount { get; set; }
}
