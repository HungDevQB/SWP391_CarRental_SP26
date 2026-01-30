using CarRental.API.DTOs.Common;
using CarRental.API.DTOs.Payment;
using CarRental.API.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CarRental.API.Controllers;

[ApiController]
[Route("api/payment")]
public class PaymentController : ControllerBase
{
    private readonly IPaymentService _paymentService;
    private int CurrentUserId => int.Parse(User.FindFirst("userId")?.Value ?? "0");

    public PaymentController(IPaymentService paymentService)
    {
        _paymentService = paymentService;
    }

    [Authorize]
    [HttpPost("vnpay/create")]
    public async Task<IActionResult> CreateVNPay([FromBody] CreatePaymentRequest request)
    {
        var url = await _paymentService.CreateVNPayUrlAsync(
            request.BookingId, request.Amount, $"Thanh toan don hang #{request.BookingId}");
        return Ok(ApiResponse<string>.Ok(url));
    }

    [HttpGet("vnpay-callback")]
    public async Task<IActionResult> VNPayCallback([FromQuery] VNPayCallbackRequest request)
    {
        var success = await _paymentService.ProcessVNPayCallbackAsync(request);
        // Redirect to frontend
        var frontendUrl = success
            ? $"http://localhost:5173/payment/success?bookingId={request.vnp_TxnRef?.Split('_')[0]}"
            : "http://localhost:5173/payment/failed";
        return Redirect(frontendUrl);
    }

    [Authorize]
    [HttpPost("momo/create")]
    public async Task<IActionResult> CreateMoMo([FromBody] CreatePaymentRequest request)
    {
        var url = await _paymentService.CreateMoMoUrlAsync(
            request.BookingId, request.Amount, $"Thanh toan don hang #{request.BookingId}");
        return Ok(ApiResponse<string>.Ok(url));
    }

    [HttpPost("momo-callback")]
    public async Task<IActionResult> MoMoCallback([FromBody] MoMoCallbackRequest request)
    {
        await _paymentService.ProcessMoMoCallbackAsync(request);
        return Ok();
    }

    [Authorize]
    [HttpGet("booking/{bookingId:int}")]
    public async Task<IActionResult> GetByBooking(int bookingId)
    {
        var payments = await _paymentService.GetByBookingAsync(bookingId);
        return Ok(ApiResponse<IEnumerable<PaymentDto>>.Ok(payments));
    }

    [Authorize(Roles = "supplier")]
    [HttpPost("{paymentId:int}/confirm-cash")]
    public async Task<IActionResult> ConfirmCash(int paymentId, [FromBody] ConfirmCashPaymentRequest request)
    {
        await _paymentService.ConfirmCashPaymentAsync(paymentId, CurrentUserId, request);
        return Ok(ApiResponse.OkNoData("Xác nhận thanh toán thành công"));
    }

    [Authorize(Roles = "supplier")]
    [HttpGet("supplier/pending-cash")]
    public async Task<IActionResult> GetPendingCash()
    {
        var items = await _paymentService.GetPendingCashConfirmationsAsync(CurrentUserId);
        return Ok(ApiResponse<IEnumerable<CashPaymentConfirmationDto>>.Ok(items));
    }

    [Authorize(Roles = "supplier,admin")]
    [HttpGet("supplier/revenue")]
    public async Task<IActionResult> GetRevenue()
    {
        var revenue = await _paymentService.GetRevenueBySupplierAsync(CurrentUserId);
        return Ok(ApiResponse<IEnumerable<SupplierRevenueDto>>.Ok(revenue));
    }
}
