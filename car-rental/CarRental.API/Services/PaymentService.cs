using System.Security.Cryptography;
using System.Text;
using CarRental.API.Data;
using CarRental.API.DTOs.Payment;
using CarRental.API.Models;
using CarRental.API.Repositories.Interfaces;
using CarRental.API.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace CarRental.API.Services;

public class PaymentService : IPaymentService
{
    private readonly IPaymentRepository _paymentRepo;
    private readonly ApplicationDbContext _context;
    private readonly IConfiguration _config;
    private readonly INotificationService _notification;

    public PaymentService(IPaymentRepository paymentRepo, ApplicationDbContext context,
        IConfiguration config, INotificationService notification)
    {
        _paymentRepo = paymentRepo;
        _context = context;
        _config = config;
        _notification = notification;
    }

    public async Task<string> CreateVNPayUrlAsync(int bookingId, decimal amount, string orderInfo)
    {
        var vnpUrl = _config["VNPay:PayUrl"] ?? "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html";
        var tmnCode = _config["VNPay:TmnCode"] ?? "";
        var hashSecret = _config["VNPay:HashSecret"] ?? "";

        var vnpParams = new SortedDictionary<string, string>
        {
            ["vnp_Version"] = "2.1.0",
            ["vnp_Command"] = "pay",
            ["vnp_TmnCode"] = tmnCode,
            ["vnp_Amount"] = ((long)(amount * 100)).ToString(),
            ["vnp_CurrCode"] = "VND",
            ["vnp_TxnRef"] = $"{bookingId}_{DateTimeOffset.UtcNow.ToUnixTimeSeconds()}",
            ["vnp_OrderInfo"] = orderInfo,
            ["vnp_OrderType"] = "other",
            ["vnp_Locale"] = "vn",
            ["vnp_ReturnUrl"] = _config["VNPay:ReturnUrl"] ?? $"http://localhost:8081/api/payment/vnpay-callback",
            ["vnp_IpAddr"] = "127.0.0.1",
            ["vnp_CreateDate"] = DateTime.Now.ToString("yyyyMMddHHmmss")
        };

        var query = string.Join("&", vnpParams.Select(kvp => $"{kvp.Key}={Uri.EscapeDataString(kvp.Value)}"));
        var checksum = HmacSHA512(hashSecret, query);

        return $"{vnpUrl}?{query}&vnp_SecureHash={checksum}";
    }

    public async Task<bool> ProcessVNPayCallbackAsync(VNPayCallbackRequest request)
    {
        if (request.vnp_ResponseCode != "00" && request.vnp_TransactionStatus != "00")
            return false;

        // Parse booking ID from TxnRef
        var parts = request.vnp_TxnRef?.Split('_');
        if (parts == null || !int.TryParse(parts[0], out var bookingId)) return false;

        var booking = await _context.Bookings.FindAsync(bookingId);
        if (booking == null) return false;

        var payment = new Payment
        {
            BookingId = bookingId,
            Amount = booking.TotalPrice,
            PaymentMethod = "VNPAY",
            PaymentStatus = "completed",
            TransactionId = request.vnp_TransactionNo,
            PaymentDate = DateTime.UtcNow
        };

        await _paymentRepo.AddAsync(payment);

        // Update booking status to confirmed
        var confirmedStatus = await _context.Statuses.FirstOrDefaultAsync(s => s.StatusName == "confirmed");
        if (confirmedStatus != null)
        {
            booking.StatusId = confirmedStatus.StatusId;
            booking.UpdatedAt = DateTime.UtcNow;
        }

        await _paymentRepo.SaveChangesAsync();
        await _notification.SendAsync(booking.CustomerId, $"Thanh toán đơn #{bookingId} thành công!", "payment", bookingId, "booking");
        return true;
    }

    public async Task<string> CreateMoMoUrlAsync(int bookingId, decimal amount, string orderInfo)
    {
        // MoMo sandbox implementation
        var endpoint = _config["MoMo:Endpoint"] ?? "https://test-payment.momo.vn/v2/gateway/api/create";
        var partnerCode = _config["MoMo:PartnerCode"] ?? "";
        var accessKey = _config["MoMo:AccessKey"] ?? "";
        var secretKey = _config["MoMo:SecretKey"] ?? "";
        var redirectUrl = _config["MoMo:ReturnUrl"] ?? $"http://localhost:8081/api/payment/momo-callback";
        var ipnUrl = _config["MoMo:NotifyUrl"] ?? $"http://localhost:8081/api/payment/momo-notify";
        var orderId = $"{bookingId}_{DateTimeOffset.UtcNow.ToUnixTimeSeconds()}";
        var requestId = Guid.NewGuid().ToString();

        var rawHash = $"accessKey={accessKey}&amount={amount}&extraData=&ipnUrl={ipnUrl}&orderId={orderId}" +
                      $"&orderInfo={orderInfo}&partnerCode={partnerCode}&redirectUrl={redirectUrl}" +
                      $"&requestId={requestId}&requestType=payWithMethod";

        var signature = HmacSHA256(secretKey, rawHash);

        // Return simplified URL (full impl would call MoMo API)
        return $"{endpoint}?orderId={orderId}&amount={amount}&signature={signature}";
    }

    public async Task<bool> ProcessMoMoCallbackAsync(MoMoCallbackRequest request)
    {
        if (request.ResultCode != 0) return false;

        var parts = request.OrderId?.Split('_');
        if (parts == null || !int.TryParse(parts[0], out var bookingId)) return false;

        var booking = await _context.Bookings.FindAsync(bookingId);
        if (booking == null) return false;

        var payment = new Payment
        {
            BookingId = bookingId,
            Amount = booking.TotalPrice,
            PaymentMethod = "MOMO",
            PaymentStatus = "completed",
            TransactionId = request.TransId.ToString(),
            PaymentDate = DateTime.UtcNow
        };

        await _paymentRepo.AddAsync(payment);
        var confirmedStatus = await _context.Statuses.FirstOrDefaultAsync(s => s.StatusName == "confirmed");
        if (confirmedStatus != null)
        {
            booking.StatusId = confirmedStatus.StatusId;
            booking.UpdatedAt = DateTime.UtcNow;
        }

        await _paymentRepo.SaveChangesAsync();
        return true;
    }

    public async Task<PaymentDto?> GetByIdAsync(int paymentId)
    {
        var p = await _paymentRepo.GetByIdAsync(paymentId);
        return p == null ? null : MapToDto(p);
    }

    public async Task<IEnumerable<PaymentDto>> GetByBookingAsync(int bookingId)
    {
        var payments = await _paymentRepo.GetByBookingAsync(bookingId);
        return payments.Select(MapToDto);
    }

    public async Task<bool> ConfirmCashPaymentAsync(int paymentId, int supplierId, ConfirmCashPaymentRequest request)
    {
        var payment = await _paymentRepo.GetByIdAsync(paymentId)
            ?? throw new KeyNotFoundException("Payment không tồn tại");

        var confirmation = await _context.CashPaymentConfirmations
            .FirstOrDefaultAsync(c => c.PaymentId == paymentId && c.SupplierId == supplierId);

        if (confirmation == null)
        {
            var feeConfig = await _context.SystemConfigurations.FirstOrDefaultAsync(c => c.ConfigKey == "platform_fee_rate");
            var feeRate = decimal.TryParse(feeConfig?.ConfigValue, out var rate) ? rate : 0.10m;

            confirmation = new CashPaymentConfirmation
            {
                PaymentId = paymentId,
                SupplierId = supplierId,
                PlatformFee = payment.Amount * feeRate,
                PlatformFeeDueDate = DateTime.UtcNow.AddDays(7)
            };
            await _context.CashPaymentConfirmations.AddAsync(confirmation);
        }

        confirmation.IsConfirmed = true;
        confirmation.ConfirmedAt = DateTime.UtcNow;
        confirmation.Notes = request.Notes;

        payment.PaymentStatus = "completed";
        _paymentRepo.Update(payment);
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<IEnumerable<CashPaymentConfirmationDto>> GetPendingCashConfirmationsAsync(int supplierId) =>
        await _context.CashPaymentConfirmations
            .Where(c => c.SupplierId == supplierId && !c.IsConfirmed && !c.IsDeleted)
            .Select(c => new CashPaymentConfirmationDto
            {
                Id = c.Id,
                PaymentId = c.PaymentId,
                SupplierId = c.SupplierId,
                IsConfirmed = c.IsConfirmed,
                ConfirmedAt = c.ConfirmedAt,
                Notes = c.Notes,
                PlatformFee = c.PlatformFee,
                PlatformFeeStatus = c.PlatformFeeStatus,
                PlatformFeeDueDate = c.PlatformFeeDueDate,
                PenaltyAmount = c.PenaltyAmount,
                TotalAmountDue = c.TotalAmountDue
            }).ToListAsync();

    public async Task<SupplierRevenueDto?> GetRevenueByBookingAsync(int bookingId)
    {
        var rev = await _context.SupplierRevenues.FirstOrDefaultAsync(r => r.BookingId == bookingId);
        return rev == null ? null : MapRevenueToDto(rev);
    }

    public async Task<IEnumerable<SupplierRevenueDto>> GetRevenueBySupplierAsync(int supplierId) =>
        (await _context.SupplierRevenues.Where(r => r.SupplierId == supplierId).ToListAsync())
        .Select(MapRevenueToDto);

    private static PaymentDto MapToDto(Payment p) => new()
    {
        PaymentId = p.PaymentId,
        BookingId = p.BookingId,
        Amount = p.Amount,
        PaymentMethod = p.PaymentMethod,
        PaymentStatus = p.PaymentStatus,
        TransactionId = p.TransactionId,
        PaymentDate = p.PaymentDate,
        CreatedAt = p.CreatedAt
    };

    private static SupplierRevenueDto MapRevenueToDto(SupplierRevenue r) => new()
    {
        RevenueId = r.RevenueId,
        BookingId = r.BookingId,
        SupplierId = r.SupplierId,
        GrossAmount = r.GrossAmount,
        PlatformFeePercentage = r.PlatformFeePercentage,
        PlatformFeeAmount = r.PlatformFeeAmount,
        NetAmount = r.NetAmount,
        RevenueStatus = r.RevenueStatus,
        PaymentDate = r.PaymentDate,
        Notes = r.Notes,
        CreatedAt = r.CreatedAt
    };

    private static string HmacSHA512(string key, string data)
    {
        using var hmac = new HMACSHA512(Encoding.UTF8.GetBytes(key));
        var bytes = hmac.ComputeHash(Encoding.UTF8.GetBytes(data));
        return string.Concat(bytes.Select(b => b.ToString("x2")));
    }

    private static string HmacSHA256(string key, string data)
    {
        using var hmac = new HMACSHA256(Encoding.UTF8.GetBytes(key));
        var bytes = hmac.ComputeHash(Encoding.UTF8.GetBytes(data));
        return string.Concat(bytes.Select(b => b.ToString("x2")));
    }
}
