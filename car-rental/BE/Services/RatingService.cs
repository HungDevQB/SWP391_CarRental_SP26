// RatingService - car rating and review management
using CarRental.API.Data;
using CarRental.API.DTOs.Common;
using CarRental.API.Models;
using CarRental.API.Repositories.Interfaces;
using CarRental.API.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace CarRental.API.Services;

public class RatingService : IRatingService
{
    private readonly IRatingRepository _ratingRepo;
    private readonly ApplicationDbContext _context;

    public RatingService(IRatingRepository ratingRepo, ApplicationDbContext context)
    {
        _ratingRepo = ratingRepo;
        _context = context;
    }

    public async Task<RatingDto> CreateAsync(int customerId, CreateRatingRequest request)
    {
        if (await _ratingRepo.HasRatedAsync(request.BookingId, customerId))
            throw new InvalidOperationException("Bạn đã đánh giá đơn đặt xe này rồi");

        var rating = new Rating
        {
            BookingId = request.BookingId,
            CustomerId = customerId,
            CarId = request.CarId,
            RatingScore = request.RatingScore,
            Comment = request.Comment
        };

        await _ratingRepo.AddAsync(rating);
        await _ratingRepo.SaveChangesAsync();

        // Update car average rating
        var avg = await _ratingRepo.GetAverageRatingAsync(request.CarId);
        // Rating and NumOfTrip columns not in DB schema - skipping car update

        return new RatingDto
        {
            RatingId = rating.RatingId,
            BookingId = rating.BookingId,
            CustomerId = rating.CustomerId,
            CarId = rating.CarId,
            RatingScore = rating.RatingScore,
            Comment = rating.Comment,
            CreatedAt = rating.RatingDate
        };
    }

    public async Task<IEnumerable<RatingDto>> GetByCarAsync(int carId)
    {
        var ratings = await _ratingRepo.GetByCarAsync(carId);
        return ratings.Select(r => new RatingDto
        {
            RatingId = r.RatingId,
            BookingId = r.BookingId,
            CustomerId = r.CustomerId,
            CustomerName = r.Customer?.FullName,
            CarId = r.CarId,
            RatingScore = r.RatingScore,
            Comment = r.Comment,
            CreatedAt = r.RatingDate
        });
    }

    public async Task<decimal> GetAverageRatingAsync(int carId) =>
        await _ratingRepo.GetAverageRatingAsync(carId);

    public async Task<bool> HasRatedAsync(int bookingId, int customerId) =>
        await _ratingRepo.HasRatedAsync(bookingId, customerId);
}
