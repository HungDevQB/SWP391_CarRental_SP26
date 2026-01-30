using CarRental.API.DTOs.Common;

namespace CarRental.API.Services.Interfaces;

public interface IRatingService
{
    Task<RatingDto> CreateAsync(int customerId, CreateRatingRequest request);
    Task<IEnumerable<RatingDto>> GetByCarAsync(int carId);
    Task<decimal> GetAverageRatingAsync(int carId);
    Task<bool> HasRatedAsync(int bookingId, int customerId);
}
