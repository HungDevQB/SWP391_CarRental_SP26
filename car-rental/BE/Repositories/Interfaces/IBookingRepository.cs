using CarRental.API.Models;

namespace CarRental.API.Repositories.Interfaces;

public interface IBookingRepository : IBaseRepository<Booking>
{
    Task<Booking?> GetWithDetailsAsync(int bookingId);
    Task<IEnumerable<Booking>> GetByCustomerAsync(int customerId);
    Task<IEnumerable<Booking>> GetByCarAsync(int carId);
    Task<IEnumerable<Booking>> GetBySupplierAsync(int supplierId);
    Task<(IEnumerable<Booking> Items, int Total)> GetPagedAsync(int page, int size, int? statusId = null);
    Task<IEnumerable<Booking>> GetActiveBookingsForCarAsync(int carId, DateTime startDate, DateTime endDate);
    Task<bool> HasActiveBookingAsync(int carId, DateTime startDate, DateTime endDate);
}
