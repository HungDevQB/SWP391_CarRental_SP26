using CarRental.API.Data;
using CarRental.API.DTOs.Booking;
using CarRental.API.DTOs.Common;
using CarRental.API.Models;
using CarRental.API.Repositories.Interfaces;
using CarRental.API.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace CarRental.API.Services;

public class BookingService : IBookingService
{
    private readonly IBookingRepository _bookingRepo;
    private readonly ICarRepository _carRepo;
    private readonly ApplicationDbContext _context;
    private readonly INotificationService _notification;
    private readonly IEmailService _email;
    private readonly IContractService _contractService;

    public BookingService(IBookingRepository bookingRepo, ICarRepository carRepo,
        ApplicationDbContext context, INotificationService notification, IEmailService email,
        IContractService contractService)
    {
        _bookingRepo = bookingRepo;
        _carRepo = carRepo;
        _context = context;
        _notification = notification;
        _email = email;
        _contractService = contractService;
    }

    public async Task<BookingDto?> GetByIdAsync(int bookingId)
    {
        var b = await _bookingRepo.GetWithDetailsAsync(bookingId);
        return b == null ? null : MapToDto(b);
    }

    public async Task<PageResponse<BookingListDto>> GetAllAsync(int page, int size, int? statusId = null)
    {
        var (items, total) = await _bookingRepo.GetPagedAsync(page, size, statusId);
        var dtos = items.Select(MapToListDto).ToList();
        return PageResponse<BookingListDto>.Create(dtos, page, size, total);
    }

    public async Task<IEnumerable<BookingListDto>> GetByCustomerAsync(int customerId)
    {
        var bookings = await _bookingRepo.GetByCustomerAsync(customerId);
        return bookings.Select(MapToListDto);
    }

    public async Task<IEnumerable<BookingListDto>> GetBySupplierAsync(int supplierId)
    {
        var bookings = await _bookingRepo.GetBySupplierAsync(supplierId);
        return bookings.Select(MapToListDto);
    }

    public async Task<BookingDto> CreateAsync(int customerId, CreateBookingRequest request)
    {
        var car = await _carRepo.GetWithDetailsAsync(request.CarId)
            ?? throw new KeyNotFoundException("Xe không tồn tại");

        var availableStatus = await _context.Statuses.FirstOrDefaultAsync(s => s.StatusName == "available");
        if (availableStatus != null && car.StatusId != availableStatus.StatusId)
            throw new InvalidOperationException("Xe không có sẵn để đặt");

        // Auto-cancel stale pending bookings from this customer for this car
        // (happens when user clicks confirm multiple times without completing payment)
        var pendingStatusForCleanup = await _context.Statuses.FirstOrDefaultAsync(s => s.StatusName == "pending");
        var cancelledStatus = await _context.Statuses.FirstOrDefaultAsync(s => s.StatusName == "cancelled");
        if (pendingStatusForCleanup != null && cancelledStatus != null)
        {
            var stalePending = await _context.Bookings
                .Where(b => b.CarId == request.CarId &&
                            b.CustomerId == customerId &&
                            b.StatusId == pendingStatusForCleanup.StatusId &&
                            !b.IsDeleted)
                .ToListAsync();
            foreach (var stale in stalePending)
            {
                stale.StatusId = cancelledStatus.StatusId;
                stale.UpdatedAt = DateTime.UtcNow;
            }
            if (stalePending.Count > 0)
                await _context.SaveChangesAsync();
        }

        var isAvailable = await _carRepo.IsAvailableAsync(request.CarId, request.StartDate, request.EndDate);
        if (!isAvailable)
            throw new InvalidOperationException("Xe đã được đặt trong khoảng thời gian này");

        // Calculate price
        int days = Math.Max(1, (int)(request.EndDate - request.StartDate).TotalDays);
        decimal basePrice = car.RentalPricePerDay * days;
        decimal discount = 0;
        int? promotionId = null;

        if (!string.IsNullOrEmpty(request.PromotionCode))
        {
            var today = DateOnly.FromDateTime(DateTime.UtcNow);
            var promo = await _context.Promotions
                .FirstOrDefaultAsync(p => p.Code == request.PromotionCode &&
                                          !p.IsDeleted &&
                                          p.EndDate >= today &&
                                          p.StartDate <= today &&
                                          (p.UsageLimit == null || p.UsedCount < p.UsageLimit));
            if (promo != null)
            {
                discount = basePrice * promo.DiscountPercentage / 100;
                if (promo.MaxDiscountAmount.HasValue)
                    discount = Math.Min(discount, promo.MaxDiscountAmount.Value);
                promotionId = promo.PromotionId;
                promo.UsedCount++;
            }
        }

        // Calculate platform fee (FeeLevel DB schema doesn't have min/max price columns, skip)
        decimal serviceFee = 0;

        decimal totalPrice = basePrice - discount + serviceFee;

        var pendingStatus = await _context.Statuses.FirstOrDefaultAsync(s => s.StatusName == "pending");

        var booking = new Booking
        {
            CustomerId = customerId,
            CarId = request.CarId,
            DriverId = request.DriverId,
            StartDate = request.StartDate,
            EndDate = request.EndDate,
            PickupLocation = request.PickupLocation,
            DropoffLocation = request.DropoffLocation,
            StatusId = pendingStatus?.StatusId ?? 1,
            RegionId = car.RegionId ?? 1,
            SeatNumber = car.Seats ?? 4,
            PromotionId = promotionId
        };

        using var tx = await _context.Database.BeginTransactionAsync();
        try
        {
            await _bookingRepo.AddAsync(booking);
            await _bookingRepo.SaveChangesAsync();

            await _context.BookingFinancials.AddAsync(new BookingFinancial
            {
                BookingId = booking.BookingId,
                TotalFare = totalPrice,
                AppliedDiscount = discount
            });
            await _context.SaveChangesAsync();
            await tx.CommitAsync();
        }
        catch
        {
            await tx.RollbackAsync();
            throw;
        }

        // Auto-generate contract for this booking (non-blocking)
        try { await _contractService.GenerateContractAsync(booking.BookingId, car.SupplierId); }
        catch { /* ignore contract errors - booking still valid */ }

        // Notify supplier (non-blocking)
        try { await _notification.SendAsync(car.SupplierId, $"Đơn đặt xe mới #{booking.BookingId}", "in_app"); }
        catch { /* ignore */ }

        // Email xác nhận sẽ được gửi sau khi thanh toán thành công (trong PaymentService)

        return (await GetByIdAsync(booking.BookingId))!;
    }

    public async Task<bool> UpdateStatusAsync(int bookingId, int statusId, int actorId)
    {
        var booking = await _bookingRepo.GetWithDetailsAsync(bookingId)
            ?? throw new KeyNotFoundException("Booking không tồn tại");

        booking.StatusId = statusId;
        booking.UpdatedAt = DateTime.UtcNow;
        _bookingRepo.Update(booking);
        await _bookingRepo.SaveChangesAsync();

        // Send notification to customer
        var status = await _context.Statuses.FindAsync(statusId);
        await _notification.SendAsync(booking.CustomerId,
            $"Đơn đặt xe #{bookingId} đã được cập nhật: {status?.StatusName}", "booking_status", bookingId, "booking");

        return true;
    }

    public async Task<CancellationDto> CancelAsync(int bookingId, int cancelledBy, string? reason)
    {
        var booking = await _bookingRepo.GetWithDetailsAsync(bookingId)
            ?? throw new KeyNotFoundException("Booking không tồn tại");

        var cancelledStatus = await _context.Statuses.FirstOrDefaultAsync(s => s.StatusName == "cancelled");
        booking.StatusId = cancelledStatus?.StatusId ?? 3;
        booking.UpdatedAt = DateTime.UtcNow;
        _bookingRepo.Update(booking);

        var cancellation = new Cancellation
        {
            BookingId = bookingId,
            CancelledBy = cancelledBy,
            Reason = reason,
            CancellationDate = DateTime.UtcNow,
            StatusId = cancelledStatus?.StatusId ?? 3 // same status as the booking cancellation
        };

        await _context.Cancellations.AddAsync(cancellation);
        await _bookingRepo.SaveChangesAsync();

        return new CancellationDto
        {
            CancellationId = cancellation.CancellationId,
            BookingId = bookingId,
            CancelledBy = cancelledBy,
            Reason = reason,
            CancellationDate = cancellation.CancellationDate
        };
    }

    public async Task<ContractDto?> GetContractAsync(int bookingId)
    {
        var contract = await _context.Contracts.FirstOrDefaultAsync(c => c.BookingId == bookingId);
        return contract == null ? null : new ContractDto
        {
            ContractId = contract.ContractId,
            BookingId = contract.BookingId,
            ContractCode = contract.ContractCode ?? "",
            CustomerId = contract.CustomerId,
            SupplierId = contract.SupplierId,
            CarId = contract.CarId,
            StartDate = contract.StartDate,
            EndDate = contract.EndDate,
            TermsAndConditions = contract.TermsAndConditions,
            SignedByCustomer = contract.SignedByCustomer,
            SignedBySupplier = contract.SignedBySupplier,
            CustomerSignature = contract.CustomerSignature,
            SupplierSignature = contract.SupplierSignature,
            ContractStatusId = contract.ContractStatusId,
            CreatedAt = contract.CreatedAt
        };
    }

    public async Task<bool> SignContractAsync(int bookingId, int userId)
    {
        var booking = await _bookingRepo.GetWithDetailsAsync(bookingId)
            ?? throw new KeyNotFoundException("Booking không tồn tại");

        var contract = await _context.Contracts.FirstOrDefaultAsync(c => c.BookingId == bookingId);
        if (contract == null)
        {
            contract = new Contract { BookingId = bookingId };
            await _context.Contracts.AddAsync(contract);
        }

        if (booking.CustomerId == userId) contract.CustomerSignature = $"signed_{userId}_{DateTime.UtcNow:yyyyMMddHHmmss}";
        else if (booking.Car?.SupplierId == userId) contract.SupplierSignature = $"signed_{userId}_{DateTime.UtcNow:yyyyMMddHHmmss}";

        contract.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<BookingFinancialDto?> GetFinancialAsync(int bookingId)
    {
        var fin = await _context.BookingFinancials.FirstOrDefaultAsync(f => f.BookingId == bookingId);
        return fin == null ? null : new BookingFinancialDto
        {
            BookingId = fin.BookingId,
            DiscountAmount = fin.AppliedDiscount,
            TotalPrice = fin.TotalFare
        };
    }

    public async Task<DepositDto?> GetDepositAsync(int bookingId)
    {
        var dep = await _context.Deposits.FirstOrDefaultAsync(d => d.BookingId == bookingId);
        return dep == null ? null : new DepositDto
        {
            DepositId = dep.DepositId,
            BookingId = dep.BookingId,
            DepositAmount = dep.DepositAmount,
            DepositStatus = dep.DepositStatus,
            DepositPaidAt = dep.DepositPaidAt,
            DepositRefundedAt = dep.DepositRefundedAt,
            RefundAmount = dep.RefundAmount
        };
    }

    private static BookingDto MapToDto(Booking b) => new()
    {
        BookingId = b.BookingId,
        CustomerId = b.CustomerId,
        CustomerName = b.Customer?.FullName,
        CarId = b.CarId,
        CarModel = b.Car?.CarModel,
        CarBrand = b.Car?.CarBrand?.BrandName,
        CarThumbnail = b.Car?.Images.FirstOrDefault()?.ImageUrl,
        DriverId = b.DriverId,
        DriverName = b.Driver?.User?.FullName,
        StartDate = b.StartDate,
        EndDate = b.EndDate,
        PickupLocation = b.PickupLocation,
        DropoffLocation = b.DropoffLocation,
        StatusName = b.Status?.StatusName,
        StatusId = b.StatusId,
        TotalPrice = b.BookingFinancial?.TotalFare ?? 0,
        PricePerDay = b.Car?.RentalPricePerDay ?? 0,
        ServiceFee = 0,
        PromotionId = b.PromotionId,
        PromotionCode = b.Promotion?.Code,
        CreatedAt = b.CreatedAt
    };

    private static BookingListDto MapToListDto(Booking b) => new()
    {
        BookingId = b.BookingId,
        CarModel = b.Car?.CarModel,
        CarBrand = b.Car?.CarBrand?.BrandName,
        CarThumbnail = b.Car?.Images.FirstOrDefault()?.ImageUrl,
        CustomerName = b.Customer?.FullName ?? b.Customer?.Username,
        StartDate = b.StartDate,
        EndDate = b.EndDate,
        TotalPrice = b.BookingFinancial?.TotalFare ?? 0,
        StatusName = b.Status?.StatusName,
        StatusId = b.StatusId,
        CreatedAt = b.CreatedAt
    };
}
