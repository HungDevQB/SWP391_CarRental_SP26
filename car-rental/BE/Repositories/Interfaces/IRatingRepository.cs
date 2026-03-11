using CarRental.API.Models;

namespace CarRental.API.Repositories.Interfaces;

public interface IRatingRepository : IBaseRepository<Rating>
{
    Task<IEnumerable<Rating>> GetByCarAsync(int carId);
    Task<decimal> GetAverageRatingAsync(int carId);
    Task<Rating?> GetByBookingAsync(int bookingId);
    Task<bool> HasRatedAsync(int bookingId, int customerId);
}
