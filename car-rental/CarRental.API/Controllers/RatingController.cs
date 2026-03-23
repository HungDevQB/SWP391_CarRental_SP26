using CarRental.API.DTOs.Common;
using CarRental.API.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CarRental.API.Controllers;

[ApiController]
[Route("api/ratings")]
public class RatingController : ControllerBase
{
    private readonly IRatingService _ratingService;
    private int CurrentUserId => int.Parse(User.FindFirst("userId")?.Value ?? "0");

    public RatingController(IRatingService ratingService)
    {
        _ratingService = ratingService;
    }

    [HttpGet("car/{carId:int}")]
    public async Task<IActionResult> GetByCar(int carId)
    {
        var ratings = await _ratingService.GetByCarAsync(carId);
        return Ok(ApiResponse<IEnumerable<RatingDto>>.Ok(ratings));
    }

    [HttpGet("car/{carId:int}/average")]
    public async Task<IActionResult> GetAverage(int carId)
    {
        var avg = await _ratingService.GetAverageRatingAsync(carId);
        return Ok(ApiResponse<decimal>.Ok(avg));
    }

    [Authorize]
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateRatingRequest request)
    {
        try
        {
            var rating = await _ratingService.CreateAsync(CurrentUserId, request);
            return Ok(ApiResponse<RatingDto>.Created(rating, "Đánh giá thành công"));
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ApiResponse<object>.Fail(ex.Message));
        }
    }
}
