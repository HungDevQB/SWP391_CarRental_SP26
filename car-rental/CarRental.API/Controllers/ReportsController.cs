using CarRental.API.Data;
using CarRental.API.DTOs.Common;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CarRental.API.Controllers;

[ApiController]
[Route("api/reports")]
[Authorize(Roles = "admin")]
public class ReportsController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public ReportsController(ApplicationDbContext context)
    {
        _context = context;
    }

    [HttpGet("overview")]
    public async Task<IActionResult> GetOverview()
    {
        // Total revenue from BookingFinancials (fallback to SupplierRevenue if empty)
        var totalRevenue = await _context.BookingFinancials
            .Where(bf => !bf.IsDeleted)
            .SumAsync(bf => (decimal?)bf.TotalFare) ?? 0;

        if (totalRevenue == 0)
        {
            totalRevenue = await _context.SupplierRevenues
                .Where(r => !r.IsDeleted)
                .SumAsync(r => (decimal?)r.Amount) ?? 0;
        }

        // Total bookings
        var totalBookings = await _context.Bookings
            .Where(b => !b.IsDeleted)
            .CountAsync();

        // Most popular car (most bookings)
        var carBookingCounts = await _context.Bookings
            .Where(b => !b.IsDeleted)
            .GroupBy(b => b.CarId)
            .Select(g => new { CarId = g.Key, Count = g.Count() })
            .OrderByDescending(x => x.Count)
            .FirstOrDefaultAsync();

        object? popularCarDetail = null;
        string? popularCarName = null;

        if (carBookingCounts != null)
        {
            var car = await _context.Cars
                .Include(c => c.Images)
                .FirstOrDefaultAsync(c => c.CarId == carBookingCounts.CarId);

            if (car != null)
            {
                var supplier = await _context.Users
                    .FirstOrDefaultAsync(u => u.UserId == car.SupplierId);

                var carRevenue = await _context.SupplierRevenues
                    .Where(r => !r.IsDeleted && r.SupplierId == car.SupplierId)
                    .SumAsync(r => (decimal?)r.Amount) ?? 0;

                popularCarName = car.CarModel;
                popularCarDetail = new
                {
                    carModel = car.CarModel,
                    licensePlate = car.LicensePlate,
                    supplierName = supplier?.Username ?? "N/A",
                    bookingCount = carBookingCounts.Count,
                    totalRevenue = carRevenue,
                    imageUrl = car.Images.FirstOrDefault()?.ImageUrl
                };
            }
        }

        // Revenue per supplier from BookingFinancials
        var suppliersRevenueRaw = await _context.BookingFinancials
            .Where(bf => !bf.IsDeleted && bf.Booking != null)
            .Join(_context.Bookings.Where(b => !b.IsDeleted),
                bf => bf.BookingId,
                b => b.BookingId,
                (bf, b) => new { bf.TotalFare, b.CarId })
            .Join(_context.Cars,
                x => x.CarId,
                c => c.CarId,
                (x, c) => new { x.TotalFare, c.SupplierId })
            .GroupBy(x => x.SupplierId)
            .Select(g => new { SupplierId = g.Key, Revenue = g.Sum(x => x.TotalFare) })
            .ToListAsync();

        var supplierIds = suppliersRevenueRaw.Select(s => s.SupplierId).ToList();
        var suppliers = await _context.Users
            .Where(u => supplierIds.Contains(u.UserId))
            .Select(u => new { u.UserId, u.Username })
            .ToListAsync();

        var suppliersRevenueResult = suppliersRevenueRaw.Select(s => new
        {
            supplierName = suppliers.FirstOrDefault(u => u.UserId == s.SupplierId)?.Username ?? $"Supplier #{s.SupplierId}",
            revenue = s.Revenue
        }).ToList();

        return Ok(ApiResponse<object>.Ok(new
        {
            totalRevenue,
            totalBookings,
            popularCar = popularCarName != null ? new { model = popularCarName } : null,
            popularCarDetail,
            suppliersRevenue = suppliersRevenueResult
        }));
    }
}
