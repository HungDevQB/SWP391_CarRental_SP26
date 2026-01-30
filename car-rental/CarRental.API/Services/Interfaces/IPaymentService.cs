using CarRental.API.DTOs.Payment;

namespace CarRental.API.Services.Interfaces;

public interface IPaymentService
{
    Task<string> CreateVNPayUrlAsync(int bookingId, decimal amount, string orderInfo);
    Task<bool> ProcessVNPayCallbackAsync(VNPayCallbackRequest request);
    Task<string> CreateMoMoUrlAsync(int bookingId, decimal amount, string orderInfo);
    Task<bool> ProcessMoMoCallbackAsync(MoMoCallbackRequest request);
    Task<PaymentDto?> GetByIdAsync(int paymentId);
    Task<IEnumerable<PaymentDto>> GetByBookingAsync(int bookingId);
    Task<bool> ConfirmCashPaymentAsync(int paymentId, int supplierId, ConfirmCashPaymentRequest request);
    Task<IEnumerable<CashPaymentConfirmationDto>> GetPendingCashConfirmationsAsync(int supplierId);
    Task<SupplierRevenueDto?> GetRevenueByBookingAsync(int bookingId);
    Task<IEnumerable<SupplierRevenueDto>> GetRevenueBySupplierAsync(int supplierId);
}
