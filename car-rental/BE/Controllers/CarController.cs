using CarRental.API.Data;
using CarRental.API.DTOs.Car;
using CarRental.API.DTOs.Common;
using CarRental.API.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CarRental.API.Controllers;

[ApiController]
[Route("api/cars")]
public class CarController : ControllerBase
{
    private readonly ICarService _carService;
    private readonly ApplicationDbContext _context;
    private int CurrentUserId => int.Parse(User.FindFirst("userId")?.Value ?? "0");

    public CarController(ICarService carService, ApplicationDbContext context)
    {
        _carService = carService;
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> Search([FromQuery] CarSearchRequest request)
    {
        var result = await _carService.SearchAsync(request);
        return Ok(ApiResponse<PageResponse<CarListDto>>.Ok(result));
    }

    [HttpGet("filter")]
    public async Task<IActionResult> Filter([FromQuery] CarSearchRequest request)
    {
        var result = await _carService.SearchAsync(request);
        return Ok(ApiResponse<PageResponse<CarListDto>>.Ok(result));
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        var car = await _carService.GetByIdAsync(id);
        return car == null
            ? NotFound(ApiResponse<object>.Fail("Xe không tồn tại", 404))
            : Ok(ApiResponse<CarDto>.Ok(car));
    }

    [HttpGet("fuel-types")]
    public async Task<IActionResult> GetFuelTypes()
    {
        var types = await _carService.GetFuelTypesAsync();
        return Ok(ApiResponse<IEnumerable<FuelTypeDto>>.Ok(types));
    }

    [HttpGet("brands")]
    public async Task<IActionResult> GetBrands()
    {
        var brands = await _carService.GetBrandsAsync();
        return Ok(ApiResponse<IEnumerable<CarBrandDto>>.Ok(brands));
    }

    [HttpGet("regions")]
    public async Task<IActionResult> GetRegions()
    {
        var regions = await _carService.GetRegionsAsync();
        return Ok(ApiResponse<IEnumerable<RegionDto>>.Ok(regions));
    }

    [HttpGet("years")]
    public async Task<IActionResult> GetYears()
    {
        var years = await _carService.GetYearsAsync();
        return Ok(ApiResponse<IEnumerable<int>>.Ok(years));
    }

    [HttpGet("featured")]
    public async Task<IActionResult> GetFeatured([FromQuery] int size = 8)
    {
        var req = new CarSearchRequest { Page = 0, Size = size, SortBy = "newest" };
        var result = await _carService.SearchAsync(req);
        return Ok(ApiResponse<PageResponse<CarListDto>>.Ok(result));
    }

    [HttpGet("popular")]
    public async Task<IActionResult> GetPopular([FromQuery] int size = 8)
    {
        var req = new CarSearchRequest { Page = 0, Size = size };
        var result = await _carService.SearchAsync(req);
        return Ok(ApiResponse<PageResponse<CarListDto>>.Ok(result));
    }

    [HttpGet("regions/country/{countryCode}")]
    public async Task<IActionResult> GetRegionsByCountry(string countryCode)
    {
        var regions = await _carService.GetRegionsAsync();
        var filtered = regions.Where(r => r.CountryCode == countryCode);
        return Ok(ApiResponse<IEnumerable<RegionDto>>.Ok(filtered));
    }

    [Authorize(Roles = "supplier,admin")]
    [HttpGet("supplier/my-cars")]
    public async Task<IActionResult> GetMyCars()
    {
        var cars = await _carService.GetBySupplierAsync(CurrentUserId);
        return Ok(ApiResponse<IEnumerable<CarListDto>>.Ok(cars));
    }

    [Authorize(Roles = "supplier,admin")]
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateCarRequest request)
    {
        try
        {
            var car = await _carService.CreateAsync(CurrentUserId, request);
            return Ok(ApiResponse<CarDto>.Created(car, "Thêm xe thành công"));
        }
        catch (Exception ex)
        {
            return BadRequest(ApiResponse<object>.Fail(ex.Message));
        }
    }

    [Authorize(Roles = "supplier,admin")]
    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateCarRequest request)
    {
        try
        {
            var car = await _carService.UpdateAsync(id, CurrentUserId, request);
            return Ok(ApiResponse<CarDto?>.Ok(car, "Cập nhật xe thành công"));
        }
        catch (UnauthorizedAccessException ex)
        {
            return Forbid();
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(ApiResponse<object>.Fail(ex.Message, 404));
        }
    }

    [Authorize(Roles = "supplier,admin")]
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        try
        {
            await _carService.DeleteAsync(id, CurrentUserId);
            return Ok(ApiResponse.OkNoData("Xóa xe thành công"));
        }
        catch (UnauthorizedAccessException)
        {
            return Forbid();
        }
    }

    [AllowAnonymous]
    [HttpGet("{id:int}/booked-dates")]
    public async Task<IActionResult> GetBookedDates(int id)
    {
        var terminalStatuses = new[] { 4, 5, 22 };
        var bookings = await _context.Bookings
            .Where(b => b.CarId == id && !b.IsDeleted && !terminalStatuses.Contains(b.StatusId))
            .Select(b => new { b.StartDate, b.EndDate })
            .ToListAsync();

        var bookedDates = new HashSet<string>();
        foreach (var b in bookings)
        {
            for (var d = b.StartDate.Date; d < b.EndDate.Date; d = d.AddDays(1))
                bookedDates.Add(d.ToString("yyyy-MM-dd"));
        }

        return Ok(new { bookedDates });
    }

    [Authorize(Roles = "supplier,admin")]
    [HttpPatch("{id:int}/status")]
    public async Task<IActionResult> UpdateStatus(int id, [FromBody] string status)
    {
        await _carService.UpdateStatusAsync(id, status);
        return Ok(ApiResponse.OkNoData("Cập nhật trạng thái thành công"));
    }

    [Authorize(Roles = "admin")]
    [HttpGet("admin/pending-cars")]
    public async Task<IActionResult> GetPendingCars()
    {
        var cars = await _context.Cars
            .Include(c => c.Images)
            .Include(c => c.CarBrand)
            .Include(c => c.FuelType)
            .Where(c => !c.IsDeleted && c.StatusId == 1) // pending
            .Select(c => new
            {
                carId = c.CarId,
                model = c.CarModel,
                year = c.Year,
                color = c.Color,
                licensePlate = c.LicensePlate,
                dailyRate = c.RentalPricePerDay,
                numOfSeats = c.Seats,
                statusId = c.StatusId,
                supplierId = c.SupplierId,
                supplier = _context.Users
                    .Where(u => u.UserId == c.SupplierId)
                    .Select(u => new { u.UserId, u.Username, u.Email })
                    .FirstOrDefault(),
                images = c.Images.Select(i => new { i.ImageId, i.ImageUrl }).ToList(),
                brand = c.CarBrand != null ? c.CarBrand.BrandName : null,
                fuelType = c.FuelType != null ? c.FuelType.FuelTypeName : null
            })
            .ToListAsync();

        return Ok(ApiResponse<object>.Ok(cars));
    }

    [Authorize(Roles = "admin")]
    [HttpPost("admin/approve-car/{id:int}")]
    public async Task<IActionResult> ApproveCar(int id)
    {
        var car = await _context.Cars.FindAsync(id);
        if (car == null) return NotFound(ApiResponse<object>.Fail("Xe không tồn tại", 404));
        car.StatusId = 11; // available
        await _context.SaveChangesAsync();
        return Ok(ApiResponse.OkNoData("Duyệt xe thành công"));
    }

    [Authorize(Roles = "admin")]
    [HttpPost("admin/reject-car/{id:int}")]
    public async Task<IActionResult> RejectCar(int id)
    {
        var car = await _context.Cars.FindAsync(id);
        if (car == null) return NotFound(ApiResponse<object>.Fail("Xe không tồn tại", 404));
        car.StatusId = 22; // rejected
        await _context.SaveChangesAsync();
        return Ok(ApiResponse.OkNoData("Từ chối xe thành công"));
    }
}
