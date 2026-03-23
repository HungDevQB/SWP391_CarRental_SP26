using CarRental.API.DTOs.Payment;

namespace CarRental.API.Services.Interfaces;

public interface IPaymentService
{
    Task<StripePaymentIntentDto> CreateStripePaymentIntentAsync(int bookingId, decimal amount);
    Task<bool> ProcessStripeWebhookAsync(string payload, string stripeSignature);
    Task<PaymentDto?> GetByIdAsync(int paymentId);
    Task<IEnumerable<PaymentDto>> GetByBookingAsync(int bookingId);
    Task<bool> ConfirmCashPaymentAsync(int paymentId, int supplierId, ConfirmCashPaymentRequest request);
    Task<IEnumerable<CashPaymentConfirmationDto>> GetPendingCashConfirmationsAsync(int supplierId);
    Task<SupplierRevenueDto?> GetRevenueByBookingAsync(int bookingId);
    Task<IEnumerable<SupplierRevenueDto>> GetRevenueBySupplierAsync(int supplierId);
}
