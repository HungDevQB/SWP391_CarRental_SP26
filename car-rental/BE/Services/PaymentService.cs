using CarRental.API.Data;
using CarRental.API.DTOs.Payment;
using CarRental.API.Models;
using CarRental.API.Repositories.Interfaces;
using CarRental.API.Services.Interfaces;
using Microsoft.EntityFrameworkCore;
using Stripe;

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
        StripeConfiguration.ApiKey = config["Stripe:SecretKey"];
    }

    // 1 USD = 25,000 VND (approximate exchange rate)
    private const decimal VND_TO_USD_RATE = 25000m;

    public async Task<StripePaymentIntentDto> CreateStripePaymentIntentAsync(int bookingId, decimal amount)
    {
        // Convert VND to USD cents for Stripe
        var amountInUsd = amount / VND_TO_USD_RATE;
        var amountInCents = (long)Math.Ceiling(amountInUsd * 100);
        if (amountInCents < 50) amountInCents = 50; // Stripe minimum $0.50
        var options = new PaymentIntentCreateOptions
        {
            Amount = amountInCents,
            Currency = "usd",
            AutomaticPaymentMethods = new PaymentIntentAutomaticPaymentMethodsOptions { Enabled = true },
            Metadata = new Dictionary<string, string> { { "bookingId", bookingId.ToString() } }
        };
        var service = new PaymentIntentService();
        var intent = await service.CreateAsync(options);
        return new StripePaymentIntentDto
        {
            ClientSecret = intent.ClientSecret,
            PaymentIntentId = intent.Id,
            Amount = amountInCents,
            Currency = "usd"
        };
    }

    public async Task<bool> ProcessStripeWebhookAsync(string payload, string stripeSignature)
    {
        var webhookSecret = _config["Stripe:WebhookSecret"] ?? "";
        Stripe.Event stripeEvent;
        try
        {
            stripeEvent = string.IsNullOrEmpty(webhookSecret)
                ? EventUtility.ParseEvent(payload)
                : EventUtility.ConstructEvent(payload, stripeSignature, webhookSecret);
        }
        catch { return false; }

        if (stripeEvent.Type != "payment_intent.succeeded") return true;
        var intent = stripeEvent.Data.Object as PaymentIntent;
        if (intent == null) return false;
        if (!intent.Metadata.TryGetValue("bookingId", out var bookingIdStr) ||
            !int.TryParse(bookingIdStr, out var bookingId)) return false;
        return await FinalizePaymentAsync(bookingId, "STRIPE", intent.Id, intent.Amount / 100m);
    }

    public async Task<bool> ConfirmStripePaymentAsync(int bookingId, string paymentIntentId)
    {
        var service = new PaymentIntentService();
        var intent = await service.GetAsync(paymentIntentId);
        if (intent.Status != "succeeded") return false;
        return await FinalizePaymentAsync(bookingId, "STRIPE", intent.Id, intent.Amount / 100m);
    }

    private async Task<bool> FinalizePaymentAsync(int bookingId, string method, string transactionId, decimal amountUsd)
    {
        var booking = await _context.Bookings.FindAsync(bookingId);
        if (booking == null) return false;
        var existing = await _context.Payments.IgnoreQueryFilters()
            .FirstOrDefaultAsync(p => p.BookingId == bookingId && p.TransactionId == transactionId);
        if (existing != null) return true;

        var completedStatus = await _context.Statuses.FirstOrDefaultAsync(s => s.StatusName == "completed")
            ?? await _context.Statuses.FirstAsync();

        // Convert USD back to VND for storage
        var amountVnd = amountUsd * VND_TO_USD_RATE;

        var payment = new Payment
        {
            BookingId = bookingId,
            Amount = amountVnd,
            PaymentMethod = method.ToLower(),
            PaymentStatusId = completedStatus.StatusId,
            TransactionId = transactionId,
            PaymentDate = DateTime.UtcNow,
            RegionId = booking.RegionId,
            PaymentType = "full_payment"
        };
        await _paymentRepo.AddAsync(payment);

        var confirmedStatus = await _context.Statuses.FirstOrDefaultAsync(s => s.StatusName == "confirmed");
        if (confirmedStatus != null)
        {
            booking.StatusId = confirmedStatus.StatusId;
            booking.UpdatedAt = DateTime.UtcNow;
        }
        await _paymentRepo.SaveChangesAsync();
        try { await _notification.SendAsync(booking.CustomerId, $"Thanh toán đơn #{bookingId} thành công!", "in_app"); }
        catch { /* ignore */ }
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
            ?? throw new KeyNotFoundException("Payment khong ton tai");
        var confirmation = await _context.CashPaymentConfirmations
            .FirstOrDefaultAsync(c => c.PaymentId == paymentId && c.SupplierId == supplierId);
        if (confirmation == null)
        {
            var feeConfig = await _context.SystemConfigurations
                .FirstOrDefaultAsync(c => c.ConfigKey == "platform_fee_rate");
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
                Id = c.Id, PaymentId = c.PaymentId, SupplierId = c.SupplierId,
                IsConfirmed = c.IsConfirmed, ConfirmedAt = c.ConfirmedAt, Notes = c.Notes,
                PlatformFee = c.PlatformFee, PlatformFeeStatus = c.PlatformFeeStatus,
                PlatformFeeDueDate = c.PlatformFeeDueDate, PenaltyAmount = c.PenaltyAmount,
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
        PaymentId = p.PaymentId, BookingId = p.BookingId, Amount = p.Amount,
        PaymentMethod = p.PaymentMethod, PaymentStatus = p.PaymentStatus,
        TransactionId = p.TransactionId, PaymentDate = p.PaymentDate, CreatedAt = p.CreatedAt
    };

    private static SupplierRevenueDto MapRevenueToDto(SupplierRevenue r) => new()
    {
        RevenueId = r.RevenueId, BookingId = r.BookingId, SupplierId = r.SupplierId,
        GrossAmount = r.GrossAmount, PlatformFeePercentage = r.PlatformFeePercentage,
        PlatformFeeAmount = r.PlatformFeeAmount, NetAmount = r.NetAmount,
        RevenueStatus = r.RevenueStatus, PaymentDate = r.PaymentDate,
        Notes = r.Notes, CreatedAt = r.CreatedAt
    };
}
