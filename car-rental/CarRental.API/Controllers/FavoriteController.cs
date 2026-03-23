using CarRental.API.Data;
using CarRental.API.DTOs.Common;
using CarRental.API.Models;
using CarRental.API.Repositories.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CarRental.API.Controllers;

[ApiController]
[Route("api/favorites")]
[Authorize]
public class FavoriteController : ControllerBase
{
    private readonly IFavoriteRepository _favoriteRepo;
    private int CurrentUserId => int.Parse(User.FindFirst("userId")?.Value ?? "0");

    public FavoriteController(IFavoriteRepository favoriteRepo)
    {
        _favoriteRepo = favoriteRepo;
    }

    [HttpGet]
    public async Task<IActionResult> GetFavorites()
    {
        var favorites = await _favoriteRepo.GetByUserAsync(CurrentUserId);
        var dtos = favorites.Select(f => new FavoriteDto
        {
            FavoriteId = f.FavoriteId,
            UserId = f.UserId,
            CarId = f.CarId,
            CarModel = f.Car?.CarModel,
            CarBrand = f.Car?.CarBrand?.BrandName,
            ImageUrl = f.Car?.Images.FirstOrDefault()?.ImageUrl,
            RentalPricePerDay = f.Car?.RentalPricePerDay ?? 0,
            CreatedAt = f.CreatedAt
        });
        return Ok(ApiResponse<IEnumerable<FavoriteDto>>.Ok(dtos));
    }

    [HttpPost("toggle")]
    public async Task<IActionResult> Toggle([FromBody] ToggleFavoriteRequest request)
    {
        var existing = await _favoriteRepo.GetByUserAndCarAsync(CurrentUserId, request.CarId);
        if (existing != null)
        {
            existing.IsDeleted = true;
            _favoriteRepo.Update(existing);
            await _favoriteRepo.SaveChangesAsync();
            return Ok(ApiResponse<bool>.Ok(false, "Đã xóa khỏi yêu thích"));
        }
        else
        {
            await _favoriteRepo.AddAsync(new Favorite { UserId = CurrentUserId, CarId = request.CarId });
            await _favoriteRepo.SaveChangesAsync();
            return Ok(ApiResponse<bool>.Ok(true, "Đã thêm vào yêu thích"));
        }
    }

    [HttpGet("check/{carId:int}")]
    public async Task<IActionResult> Check(int carId)
    {
        var isFav = await _favoriteRepo.IsFavoriteAsync(CurrentUserId, carId);
        return Ok(ApiResponse<bool>.Ok(isFav));
    }
}
