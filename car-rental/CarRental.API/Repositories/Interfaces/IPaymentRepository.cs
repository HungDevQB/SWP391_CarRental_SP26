using CarRental.API.Models;

namespace CarRental.API.Repositories.Interfaces;

public interface IPaymentRepository : IBaseRepository<Payment>
{
    Task<Payment?> GetByTransactionIdAsync(string transactionId);
    Task<IEnumerable<Payment>> GetByBookingAsync(int bookingId);
    Task<IEnumerable<Payment>> GetByStatusAsync(string status);
}
