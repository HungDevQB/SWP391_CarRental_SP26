using CarRental.API.Data;
using CarRental.API.Models;
using CarRental.API.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace CarRental.API.Repositories;

public class PaymentRepository : BaseRepository<Payment>, IPaymentRepository
{
    public PaymentRepository(ApplicationDbContext context) : base(context) { }

    public async Task<Payment?> GetByTransactionIdAsync(string transactionId) =>
        await _dbSet.FirstOrDefaultAsync(p => p.TransactionId == transactionId);

    public async Task<IEnumerable<Payment>> GetByBookingAsync(int bookingId) =>
        await _dbSet.Where(p => p.BookingId == bookingId)
                    .OrderByDescending(p => p.CreatedAt)
                    .ToListAsync();

    public async Task<IEnumerable<Payment>> GetByStatusAsync(string status) =>
        await _dbSet.Where(p => p.PaymentStatus == status).ToListAsync();
}
