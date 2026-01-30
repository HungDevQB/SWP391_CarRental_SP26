using CarRental.API.Data;
using CarRental.API.Models;
using CarRental.API.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace CarRental.API.Repositories;

public class RatingRepository : BaseRepository<Rating>, IRatingRepository
{
    public RatingRepository(ApplicationDbContext context) : base(context) { }

    public async Task<IEnumerable<Rating>> GetByCarAsync(int carId) =>
        await _dbSet.Include(r => r.Customer)
                    .Where(r => r.CarId == carId)
                    .OrderByDescending(r => r.CreatedAt)
                    .ToListAsync();

    public async Task<decimal> GetAverageRatingAsync(int carId)
    {
        var ratings = await _dbSet.Where(r => r.CarId == carId).ToListAsync();
        return ratings.Any() ? ratings.Average(r => r.RatingScore) : 0;
    }

    public async Task<Rating?> GetByBookingAsync(int bookingId) =>
        await _dbSet.FirstOrDefaultAsync(r => r.BookingId == bookingId);

    public async Task<bool> HasRatedAsync(int bookingId, int customerId) =>
        await _dbSet.AnyAsync(r => r.BookingId == bookingId && r.CustomerId == customerId);
}
