using CarRental.API.Data;
using CarRental.API.DTOs.Common;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CarRental.API.Controllers;

[ApiController]
[Route("api/country-codes")]
public class CountryCodeController : ControllerBase
{
    private readonly ApplicationDbContext _db;

    public CountryCodeController(ApplicationDbContext db)
    {
        _db = db;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var codes = await _db.CountryCodes
            .Select(c => new { c.Code, c.CountryName })
            .OrderBy(c => c.CountryName)
            .ToListAsync();
        return Ok(ApiResponse<object>.Ok(codes));
    }
}
