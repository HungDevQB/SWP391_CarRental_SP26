using CarRental.API.Data;
using CarRental.API.Models;
using CarRental.API.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace CarRental.API.Repositories;

public class CarRepository : BaseRepository<Car>, ICarRepository
{
    public CarRepository(ApplicationDbContext context) : base(context) { }

    public async Task<Car?> GetWithDetailsAsync(int carId) =>
        await _dbSet.Include(c => c.CarBrand)
                    .Include(c => c.FuelType)
                    .Include(c => c.Region)
                    .Include(c => c.Supplier)
                    .Include(c => c.Images)
                    .Include(c => c.Ratings)
                    .FirstOrDefaultAsync(c => c.CarId == carId);

    public async Task<(IEnumerable<Car> Items, int Total)> SearchAsync(
        int? regionId, string? location, DateTime? startDate, DateTime? endDate,
        int? seats, string? transmission, int? fuelTypeId, int? carBrandId,
        decimal? minPrice, decimal? maxPrice, int? year,
        string? sortBy, bool sortDesc, int page, int size)
    {
        var query = _dbSet
            .Include(c => c.CarBrand)
            .Include(c => c.FuelType)
            .Include(c => c.Region)
            .Include(c => c.Images)
            .AsQueryable();

        if (regionId.HasValue) query = query.Where(c => c.RegionId == regionId);
        if (!string.IsNullOrEmpty(location)) query = query.Where(c => c.Location != null && c.Location.Contains(location));
        if (seats.HasValue) query = query.Where(c => c.Seats >= seats);
        if (!string.IsNullOrEmpty(transmission)) query = query.Where(c => c.Transmission == transmission);
        if (fuelTypeId.HasValue) query = query.Where(c => c.FuelTypeId == fuelTypeId);
        if (carBrandId.HasValue) query = query.Where(c => c.CarBrandId == carBrandId);
        if (minPrice.HasValue) query = query.Where(c => c.RentalPricePerDay >= minPrice);
        if (maxPrice.HasValue) query = query.Where(c => c.RentalPricePerDay <= maxPrice);
        if (year.HasValue) query = query.Where(c => c.Year == year);

        // Exclude cars with active bookings in the date range
        if (startDate.HasValue && endDate.HasValue)
        {
            var sd = startDate.Value;
            var ed = endDate.Value;
            query = query.Where(c => !c.Bookings.Any(b =>
                b.StartDate < ed && b.EndDate > sd && !b.IsDeleted &&
                b.StatusId != 3)); // 3 = CANCELLED
        }

        query = query.Where(c => c.Status == "AVAILABLE");

        query = sortBy?.ToLower() switch
        {
            "price_asc" => query.OrderBy(c => c.RentalPricePerDay),
            "price_desc" => query.OrderByDescending(c => c.RentalPricePerDay),
            "rating" => query.OrderByDescending(c => c.Rating),
            "newest" => query.OrderByDescending(c => c.CreatedAt),
            _ => query.OrderByDescending(c => c.NumOfTrip)
        };

        var total = await query.CountAsync();
        var items = await query.Skip(page * size).Take(size).ToListAsync();
        return (items, total);
    }

    public async Task<IEnumerable<Car>> GetBySupplierAsync(int supplierId) =>
        await _dbSet.Include(c => c.CarBrand)
                    .Include(c => c.FuelType)
                    .Include(c => c.Images)
                    .Where(c => c.SupplierId == supplierId)
                    .ToListAsync();

    public async Task<IEnumerable<int>> GetDistinctYearsAsync() =>
        await _dbSet.Where(c => c.Year.HasValue)
                    .Select(c => c.Year!.Value)
                    .Distinct()
                    .OrderByDescending(y => y)
                    .ToListAsync();

    public async Task<bool> IsAvailableAsync(int carId, DateTime startDate, DateTime endDate, int? excludeBookingId = null)
    {
        var query = _context.Bookings
            .Where(b => b.CarId == carId &&
                        !b.IsDeleted &&
                        b.StatusId != 3 && // not cancelled
                        b.StartDate < endDate &&
                        b.EndDate > startDate);

        if (excludeBookingId.HasValue)
            query = query.Where(b => b.BookingId != excludeBookingId.Value);

        return !await query.AnyAsync();
    }
}
