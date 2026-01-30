using CarRental.API.DTOs.Car;
using CarRental.API.DTOs.Common;

namespace CarRental.API.Services.Interfaces;

public interface ICarService
{
    Task<CarDto?> GetByIdAsync(int carId);
    Task<PageResponse<CarListDto>> SearchAsync(CarSearchRequest request);
    Task<CarDto> CreateAsync(int supplierId, CreateCarRequest request);
    Task<CarDto?> UpdateAsync(int carId, int supplierId, UpdateCarRequest request);
    Task<bool> DeleteAsync(int carId, int supplierId);
    Task<IEnumerable<CarListDto>> GetBySupplierAsync(int supplierId);
    Task<IEnumerable<CarBrandDto>> GetBrandsAsync();
    Task<IEnumerable<FuelTypeDto>> GetFuelTypesAsync();
    Task<IEnumerable<RegionDto>> GetRegionsAsync();
    Task<IEnumerable<int>> GetYearsAsync();
    Task<bool> UpdateStatusAsync(int carId, string status);
}
