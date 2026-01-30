using CarRental.API.Data;
using CarRental.API.Models;
using CarRental.API.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace CarRental.API.Repositories;

public class BookingRepository : BaseRepository<Booking>, IBookingRepository
{
    public BookingRepository(ApplicationDbContext context) : base(context) { }

    public async Task<Booking?> GetWithDetailsAsync(int bookingId) =>
        await _dbSet
            .Include(b => b.Customer)
            .Include(b => b.Car).ThenInclude(c => c!.CarBrand)
            .Include(b => b.Car).ThenInclude(c => c!.Images)
            .Include(b => b.Driver).ThenInclude(d => d!.User)
            .Include(b => b.Status)
            .Include(b => b.Promotion)
            .Include(b => b.BookingFinancial)
            .Include(b => b.Deposit)
            .FirstOrDefaultAsync(b => b.BookingId == bookingId);

    public async Task<IEnumerable<Booking>> GetByCustomerAsync(int customerId) =>
        await _dbSet
            .Include(b => b.Car).ThenInclude(c => c!.CarBrand)
            .Include(b => b.Car).ThenInclude(c => c!.Images)
            .Include(b => b.Status)
            .Where(b => b.CustomerId == customerId)
            .OrderByDescending(b => b.CreatedAt)
            .ToListAsync();

    public async Task<IEnumerable<Booking>> GetByCarAsync(int carId) =>
        await _dbSet.Where(b => b.CarId == carId)
                    .Include(b => b.Status)
                    .OrderByDescending(b => b.CreatedAt)
                    .ToListAsync();

    public async Task<IEnumerable<Booking>> GetBySupplierAsync(int supplierId) =>
        await _dbSet
            .Include(b => b.Car)
            .Include(b => b.Customer)
            .Include(b => b.Status)
            .Where(b => b.Car != null && b.Car.SupplierId == supplierId)
            .OrderByDescending(b => b.CreatedAt)
            .ToListAsync();

    public async Task<(IEnumerable<Booking> Items, int Total)> GetPagedAsync(int page, int size, int? statusId = null)
    {
        var query = _dbSet
            .Include(b => b.Customer)
            .Include(b => b.Car).ThenInclude(c => c!.CarBrand)
            .Include(b => b.Status)
            .AsQueryable();

        if (statusId.HasValue)
            query = query.Where(b => b.StatusId == statusId);

        var total = await query.CountAsync();
        var items = await query.OrderByDescending(b => b.CreatedAt)
                               .Skip(page * size).Take(size).ToListAsync();
        return (items, total);
    }

    public async Task<IEnumerable<Booking>> GetActiveBookingsForCarAsync(int carId, DateTime startDate, DateTime endDate) =>
        await _dbSet.Where(b => b.CarId == carId &&
                                !b.IsDeleted &&
                                b.StatusId != 3 &&
                                b.StartDate < endDate &&
                                b.EndDate > startDate)
                    .ToListAsync();

    public async Task<bool> HasActiveBookingAsync(int carId, DateTime startDate, DateTime endDate) =>
        await _dbSet.AnyAsync(b => b.CarId == carId &&
                                   !b.IsDeleted &&
                                   b.StatusId != 3 &&
                                   b.StartDate < endDate &&
                                   b.EndDate > startDate);
}
