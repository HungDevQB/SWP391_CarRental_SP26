// BookingController - REST API endpoints for booking management
using CarRental.API.DTOs.Booking;
using CarRental.API.DTOs.Common;
using CarRental.API.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CarRental.API.Controllers;

[ApiController]
[Route("api/bookings")]
[Authorize]
public class BookingController : ControllerBase
{
    private readonly IBookingService _bookingService;
    private int CurrentUserId => int.Parse(User.FindFirst("userId")?.Value ?? "0");

    public BookingController(IBookingService bookingService)
    {
        _bookingService = bookingService;
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        var booking = await _bookingService.GetByIdAsync(id);
        return booking == null
            ? NotFound(ApiResponse<object>.Fail("Booking không tồn tại", 404))
            : Ok(ApiResponse<BookingDto>.Ok(booking));
    }

    [Authorize(Roles = "admin")]
    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] int page = 0, [FromQuery] int size = 10,
        [FromQuery] int? statusId = null)
    {
        var result = await _bookingService.GetAllAsync(page, size, statusId);
        return Ok(ApiResponse<PageResponse<BookingListDto>>.Ok(result));
    }

    [HttpGet("my-bookings")]
    public async Task<IActionResult> GetMyBookings()
    {
        var bookings = await _bookingService.GetByCustomerAsync(CurrentUserId);
        return Ok(ApiResponse<IEnumerable<BookingListDto>>.Ok(bookings));
    }

    [Authorize(Roles = "supplier,admin")]
    [HttpGet("supplier/bookings")]
    public async Task<IActionResult> GetSupplierBookings()
    {
        var bookings = await _bookingService.GetBySupplierAsync(CurrentUserId);
        return Ok(ApiResponse<IEnumerable<BookingListDto>>.Ok(bookings));
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateBookingRequest request)
    {
        try
        {
            var booking = await _bookingService.CreateAsync(CurrentUserId, request);
            return Ok(ApiResponse<BookingDto>.Created(booking, "Đặt xe thành công"));
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ApiResponse<object>.Fail(ex.Message));
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(ApiResponse<object>.Fail(ex.Message, 404));
        }
    }

    [HttpPatch("{id:int}/status")]
    public async Task<IActionResult> UpdateStatus(int id, [FromBody] UpdateBookingStatusRequest request)
    {
        await _bookingService.UpdateStatusAsync(id, request.StatusId, CurrentUserId);
        return Ok(ApiResponse.OkNoData("Cập nhật trạng thái thành công"));
    }

    [HttpPost("{id:int}/cancel")]
    public async Task<IActionResult> Cancel(int id, [FromBody] CreateCancellationRequest? request = null)
    {
        var result = await _bookingService.CancelAsync(id, CurrentUserId, request?.Reason);
        return Ok(ApiResponse<CancellationDto>.Ok(result, "Hủy đặt xe thành công"));
    }

    [HttpGet("{id:int}/contract")]
    public async Task<IActionResult> GetContract(int id)
    {
        var contract = await _bookingService.GetContractAsync(id);
        return Ok(ApiResponse<ContractDto?>.Ok(contract));
    }

    [HttpPost("{id:int}/contract/sign")]
    public async Task<IActionResult> SignContract(int id)
    {
        await _bookingService.SignContractAsync(id, CurrentUserId);
        return Ok(ApiResponse.OkNoData("Ký hợp đồng thành công"));
    }

    [HttpGet("{id:int}/financial")]
    public async Task<IActionResult> GetFinancial(int id)
    {
        var fin = await _bookingService.GetFinancialAsync(id);
        return Ok(ApiResponse<BookingFinancialDto?>.Ok(fin));
    }

    [HttpGet("{id:int}/deposit")]
    public async Task<IActionResult> GetDeposit(int id)
    {
        var dep = await _bookingService.GetDepositAsync(id);
        return Ok(ApiResponse<DepositDto?>.Ok(dep));
    }
}
