// CarService - car management and search business logic
using CarRental.API.Data;
using CarRental.API.DTOs.Car;
using CarRental.API.DTOs.Common;
using CarRental.API.Models;
using CarRental.API.Repositories.Interfaces;
using CarRental.API.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace CarRental.API.Services;

public class CarService : ICarService
{
    private readonly ICarRepository _carRepo;
    private readonly ApplicationDbContext _context;

    public CarService(ICarRepository carRepo, ApplicationDbContext context)
    {
        _carRepo = carRepo;
        _context = context;
    }

    public async Task<CarDto?> GetByIdAsync(int carId)
    {
        var car = await _carRepo.GetWithDetailsAsync(carId);
        return car == null ? null : MapToDto(car);
    }

    public async Task<PageResponse<CarListDto>> SearchAsync(CarSearchRequest req)
    {
        bool sortDesc = req.SortDir?.ToLower() == "desc";
        var (items, total) = await _carRepo.SearchAsync(
            req.RegionId, req.Location, req.StartDate, req.EndDate,
            req.Seats, req.Transmission, req.FuelTypeId, req.CarBrandId,
            req.MinPrice, req.MaxPrice, req.Year,
            req.SortBy, sortDesc, req.Page, req.Size, req.Keyword);

        var dtos = items.Select(MapToListDto).ToList();
        return PageResponse<CarListDto>.Create(dtos, req.Page, req.Size, total);
    }

    public async Task<CarDto> CreateAsync(int supplierId, CreateCarRequest request)
    {
        var car = new Car
        {
            SupplierId = supplierId,
            CarBrandId = request.CarBrandId,
            FuelTypeId = request.FuelTypeId,
            CarModel = request.CarModel,
            LicensePlate = request.LicensePlate,
            Year = request.Year,
            Seats = (byte?)request.Seats,
            Transmission = request.Transmission,
            RentalPricePerDay = request.RentalPricePerDay,
            Description = request.Description,
            RegionId = request.RegionId,
            StatusId = 1 // pending — chờ admin duyệt
        };

        await _carRepo.AddAsync(car);
        await _carRepo.SaveChangesAsync();

        if (request.ImageUrls?.Any() == true)
        {
            var images = request.ImageUrls.Select(url => new Image { CarId = car.CarId, ImageUrl = url });
            await _context.Images.AddRangeAsync(images);
            await _context.SaveChangesAsync();
        }

        return (await GetByIdAsync(car.CarId))!;
    }

    public async Task<CarDto?> UpdateAsync(int carId, int supplierId, UpdateCarRequest request)
    {
        var car = await _carRepo.GetByIdAsync(carId)
            ?? throw new KeyNotFoundException("Xe không tồn tại");

        if (car.SupplierId != supplierId)
            throw new UnauthorizedAccessException("Bạn không có quyền sửa xe này");

        if (request.CarBrandId.HasValue) car.CarBrandId = request.CarBrandId.Value;
        if (request.FuelTypeId.HasValue) car.FuelTypeId = request.FuelTypeId.Value;
        if (request.CarModel != null) car.CarModel = request.CarModel;
        if (request.LicensePlate != null) car.LicensePlate = request.LicensePlate;
        if (request.Year.HasValue) car.Year = request.Year;
        if (request.Seats.HasValue) car.Seats = (byte?)request.Seats;
        if (request.Transmission != null) car.Transmission = request.Transmission;
        if (request.RentalPricePerDay.HasValue) car.RentalPricePerDay = request.RentalPricePerDay.Value;
        if (request.Description != null) car.Description = request.Description;
        if (request.RegionId.HasValue) car.RegionId = request.RegionId;
        if (request.Status != null)
        {
            var status = await _context.Statuses.FirstOrDefaultAsync(s => s.StatusName.ToLower() == request.Status.ToLower());
            if (status != null) car.StatusId = status.StatusId;
        }
        car.UpdatedAt = DateTime.UtcNow;

        _carRepo.Update(car);

        if (request.ImageUrls != null)
        {
            var oldImages = await _context.Images.Where(i => i.CarId == carId).ToListAsync();
            _context.Images.RemoveRange(oldImages);
            var newImages = request.ImageUrls.Select(url => new Image { CarId = carId, ImageUrl = url });
            await _context.Images.AddRangeAsync(newImages);
        }

        await _carRepo.SaveChangesAsync();
        return await GetByIdAsync(carId);
    }

    public async Task<bool> DeleteAsync(int carId, int supplierId)
    {
        var car = await _carRepo.GetByIdAsync(carId)
            ?? throw new KeyNotFoundException("Xe không tồn tại");

        if (car.SupplierId != supplierId)
            throw new UnauthorizedAccessException("Bạn không có quyền xóa xe này");

        car.IsDeleted = true;
        car.UpdatedAt = DateTime.UtcNow;
        _carRepo.Update(car);
        await _carRepo.SaveChangesAsync();
        return true;
    }

    public async Task<IEnumerable<CarListDto>> GetBySupplierAsync(int supplierId)
    {
        var cars = await _carRepo.GetBySupplierAsync(supplierId);
        return cars.Select(MapToListDto);
    }

    public async Task<IEnumerable<CarBrandDto>> GetBrandsAsync() =>
        await _context.CarBrands.Select(b => new CarBrandDto
        {
            CarBrandId = b.CarBrandId,
            BrandName = b.BrandName
        }).ToListAsync();

    public async Task<IEnumerable<FuelTypeDto>> GetFuelTypesAsync() =>
        await _context.FuelTypes.Select(f => new FuelTypeDto
        {
            FuelTypeId = f.FuelTypeId,
            FuelTypeName = f.FuelTypeName
        }).ToListAsync();

    public async Task<IEnumerable<RegionDto>> GetRegionsAsync() =>
        await _context.Regions.Select(r => new RegionDto
        {
            RegionId = r.RegionId,
            RegionName = r.RegionName,
            Currency = r.Currency,
            CountryCode = r.CountryCode
        }).ToListAsync();

    public async Task<IEnumerable<int>> GetYearsAsync() =>
        await _carRepo.GetDistinctYearsAsync();

    public async Task<bool> UpdateStatusAsync(int carId, string status)
    {
        var car = await _carRepo.GetByIdAsync(carId)
            ?? throw new KeyNotFoundException("Xe không tồn tại");
        var statusEntity = await _context.Statuses.FirstOrDefaultAsync(s => s.StatusName.ToLower() == status.ToLower());
        if (statusEntity != null) car.StatusId = statusEntity.StatusId;
        car.UpdatedAt = DateTime.UtcNow;
        _carRepo.Update(car);
        await _carRepo.SaveChangesAsync();
        return true;
    }

    private static CarDto MapToDto(Car c) => new()
    {
        CarId = c.CarId,
        SupplierId = c.SupplierId,
        SupplierName = c.Supplier?.FullName,
        CarBrandId = c.CarBrandId,
        BrandName = c.CarBrand?.BrandName,
        FuelTypeId = c.FuelTypeId,
        FuelTypeName = c.FuelType?.FuelTypeName,
        CarModel = c.CarModel,
        LicensePlate = c.LicensePlate,
        Year = c.Year,
        Seats = c.Seats,
        Color = c.Color,
        Transmission = c.Transmission,
        RentalPricePerDay = c.RentalPricePerDay,
        Description = c.Description,
        Status = c.Status?.StatusName ?? "available",
        RegionId = c.RegionId,
        RegionName = c.Region?.RegionName,
        Location = null,
        NumOfTrip = c.Ratings?.Count(r => !r.IsDeleted) ?? 0,
        Rating = c.Ratings != null && c.Ratings.Any(r => !r.IsDeleted)
            ? (decimal)c.Ratings.Where(r => !r.IsDeleted).Average(r => (double)r.RatingScore)
            : 0,
        AverageRating = c.Ratings != null && c.Ratings.Any(r => !r.IsDeleted)
            ? (decimal)c.Ratings.Where(r => !r.IsDeleted).Average(r => (double)r.RatingScore)
            : 0,
        ImageUrls = c.Images.Select(i => i.ImageUrl).ToList(),
        CreatedAt = c.CreatedAt
    };

    private static CarListDto MapToListDto(Car c) => new()
    {
        CarId = c.CarId,
        BrandName = c.CarBrand?.BrandName,
        CarModel = c.CarModel,
        Year = c.Year,
        Seats = c.Seats,
        Transmission = c.Transmission,
        RentalPricePerDay = c.RentalPricePerDay,
        Status = c.Status?.StatusName ?? "available",
        Location = null,
        RegionName = c.Region?.RegionName,
        Rating = c.Ratings != null && c.Ratings.Any(r => !r.IsDeleted)
            ? (decimal)c.Ratings.Where(r => !r.IsDeleted).Average(r => (double)r.RatingScore)
            : 0,
        AverageRating = c.Ratings != null && c.Ratings.Any(r => !r.IsDeleted)
            ? (decimal)c.Ratings.Where(r => !r.IsDeleted).Average(r => (double)r.RatingScore)
            : 0,
        NumOfTrip = c.Ratings?.Count(r => !r.IsDeleted) ?? 0,
        ThumbnailUrl = c.Images.FirstOrDefault()?.ImageUrl,
        FuelTypeName = c.FuelType?.FuelTypeName
    };
}
