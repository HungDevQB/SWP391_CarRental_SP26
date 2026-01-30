using CarRental.API.DTOs.Car;
using CarRental.API.DTOs.Common;
using CarRental.API.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CarRental.API.Controllers;

[ApiController]
[Route("api/cars")]
public class CarController : ControllerBase
{
    private readonly ICarService _carService;
    private int CurrentUserId => int.Parse(User.FindFirst("userId")?.Value ?? "0");

    public CarController(ICarService carService)
    {
        _carService = carService;
    }

    [HttpGet]
    public async Task<IActionResult> Search([FromQuery] CarSearchRequest request)
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

    [Authorize(Roles = "supplier,admin")]
    [HttpPatch("{id:int}/status")]
    public async Task<IActionResult> UpdateStatus(int id, [FromBody] string status)
    {
        await _carService.UpdateStatusAsync(id, status);
        return Ok(ApiResponse.OkNoData("Cập nhật trạng thái thành công"));
    }
}
