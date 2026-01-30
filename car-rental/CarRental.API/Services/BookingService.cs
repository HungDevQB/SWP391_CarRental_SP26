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

    public BookingService(IBookingRepository bookingRepo, ICarRepository carRepo,
        ApplicationDbContext context, INotificationService notification, IEmailService email)
    {
        _bookingRepo = bookingRepo;
        _carRepo = carRepo;
        _context = context;
        _notification = notification;
        _email = email;
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

        if (car.Status != "AVAILABLE")
            throw new InvalidOperationException("Xe không có sẵn để đặt");

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
            var promo = await _context.Promotions
                .FirstOrDefaultAsync(p => p.Code == request.PromotionCode &&
                                          !p.IsDeleted &&
                                          (p.EndDate == null || p.EndDate >= DateTime.UtcNow) &&
                                          (p.StartDate == null || p.StartDate <= DateTime.UtcNow) &&
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

        // Calculate platform fee
        var feeLevel = await _context.FeeLevels
            .FirstOrDefaultAsync(f => !f.IsDeleted && f.MinPrice <= basePrice && f.MaxPrice >= basePrice);
        decimal serviceFee = feeLevel != null ? basePrice * feeLevel.FeePercentage / 100 : 0;

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
            TotalPrice = totalPrice,
            PricePerDay = car.RentalPricePerDay,
            ServiceFee = serviceFee,
            PaymentMethod = request.PaymentMethod,
            PromotionId = promotionId
        };

        await _bookingRepo.AddAsync(booking);
        await _bookingRepo.SaveChangesAsync();

        // Create financial record
        await _context.BookingFinancials.AddAsync(new BookingFinancial
        {
            BookingId = booking.BookingId,
            BasePrice = basePrice,
            ServiceFee = serviceFee,
            DiscountAmount = discount,
            Subtotal = basePrice - discount,
            TotalPrice = totalPrice
        });
        await _context.SaveChangesAsync();

        // Notify supplier
        await _notification.SendAsync(car.SupplierId, $"Đơn đặt xe mới #{booking.BookingId}", "booking", booking.BookingId, "booking");

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
            CancellationDate = DateTime.UtcNow
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
            ContractContent = contract.ContractContent,
            SignedByCustomer = contract.SignedByCustomer,
            SignedBySupplier = contract.SignedBySupplier,
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

        if (booking.CustomerId == userId) contract.SignedByCustomer = true;
        else if (booking.Car?.SupplierId == userId) contract.SignedBySupplier = true;

        contract.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<BookingFinancialDto?> GetFinancialAsync(int bookingId)
    {
        var fin = await _context.BookingFinancials.FirstOrDefaultAsync(f => f.BookingId == bookingId);
        return fin == null ? null : new BookingFinancialDto
        {
            BookingFinancialId = fin.BookingFinancialId,
            BookingId = fin.BookingId,
            BasePrice = fin.BasePrice,
            InsuranceFee = fin.InsuranceFee,
            ServiceFee = fin.ServiceFee,
            DriverFee = fin.DriverFee,
            DiscountAmount = fin.DiscountAmount,
            Subtotal = fin.Subtotal,
            TaxAmount = fin.TaxAmount,
            TotalPrice = fin.TotalPrice
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
        TotalPrice = b.TotalPrice,
        PricePerDay = b.PricePerDay,
        ServiceFee = b.ServiceFee,
        PaymentMethod = b.PaymentMethod,
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
        StartDate = b.StartDate,
        EndDate = b.EndDate,
        TotalPrice = b.TotalPrice,
        StatusName = b.Status?.StatusName,
        StatusId = b.StatusId,
        CreatedAt = b.CreatedAt
    };
}
