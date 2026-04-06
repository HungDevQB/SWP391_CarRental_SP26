using CarRental.API.DTOs.Common;
using CarRental.API.DTOs.Payment;
using CarRental.API.Services;
using CarRental.API.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CarRental.API.Controllers;

[ApiController]
[Route("api/payment")]
public class PaymentController : ControllerBase
{
    private readonly IPaymentService _paymentService;
    private readonly IConfiguration _config;
    private int CurrentUserId => int.Parse(User.FindFirst("userId")?.Value ?? "0");

    public PaymentController(IPaymentService paymentService, IConfiguration config)
    {
        _paymentService = paymentService;
        _config = config;
    }

    [Authorize(Roles = "admin")]
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var payments = await _paymentService.GetAllAsync();
        return Ok(ApiResponse<IEnumerable<AdminPaymentDto>>.Ok(payments));
    }

    [Authorize]
    [HttpPost("stripe/create-intent")]
    public async Task<IActionResult> CreateStripeIntent([FromBody] CreateStripePaymentRequest request)
    {
        var result = await _paymentService.CreateStripePaymentIntentAsync(request.BookingId, request.Amount);
        return Ok(ApiResponse<StripePaymentIntentDto>.Ok(result));
    }

    [HttpPost("stripe/webhook")]
    public async Task<IActionResult> StripeWebhook()
    {
        var payload = await new StreamReader(HttpContext.Request.Body).ReadToEndAsync();
        var signature = Request.Headers["Stripe-Signature"].ToString();
        var success = await _paymentService.ProcessStripeWebhookAsync(payload, signature);
        return success ? Ok() : BadRequest();
    }

    [Authorize]
    [HttpPost("stripe/confirm")]
    public async Task<IActionResult> ConfirmStripe([FromBody] ConfirmStripeRequest request)
    {
        var paymentService = (PaymentService)_paymentService;
        var success = await paymentService.ConfirmStripePaymentAsync(request.BookingId, request.PaymentIntentId);
        return success
            ? Ok(ApiResponse.OkNoData("Thanh toan thanh cong"))
            : BadRequest(ApiResponse<object>.Fail("Thanh toan chua hoan tat"));
    }

    [HttpGet("stripe/publishable-key")]
    public IActionResult GetPublishableKey()
    {
        return Ok(ApiResponse<string>.Ok(_config["Stripe:PublishableKey"] ?? ""));
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
        return Ok(ApiResponse.OkNoData("Xac nhan thanh toan thanh cong"));
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

public class ConfirmStripeRequest
{
    public int BookingId { get; set; }
    public string PaymentIntentId { get; set; } = string.Empty;
}
