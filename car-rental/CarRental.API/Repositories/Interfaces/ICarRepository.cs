using CarRental.API.Models;

namespace CarRental.API.Repositories.Interfaces;

public interface ICarRepository : IBaseRepository<Car>
{
    Task<Car?> GetWithDetailsAsync(int carId);
    Task<(IEnumerable<Car> Items, int Total)> SearchAsync(
        int? regionId, string? location, DateTime? startDate, DateTime? endDate,
        int? seats, string? transmission, int? fuelTypeId, int? carBrandId,
        decimal? minPrice, decimal? maxPrice, int? year,
        string? sortBy, bool sortDesc, int page, int size, string? keyword = null);
    Task<IEnumerable<Car>> GetBySupplierAsync(int supplierId);
    Task<IEnumerable<int>> GetDistinctYearsAsync();
    Task<bool> IsAvailableAsync(int carId, DateTime startDate, DateTime endDate, int? excludeBookingId = null);
}
