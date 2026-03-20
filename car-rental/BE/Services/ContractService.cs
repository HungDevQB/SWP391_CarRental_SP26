// ContractService - digital contract generation and signature management
using CarRental.API.Data;
using CarRental.API.DTOs.Booking;
using CarRental.API.Models;
using CarRental.API.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace CarRental.API.Services;

public class ContractService : IContractService
{
    private readonly ApplicationDbContext _context;
    private readonly INotificationService _notification;

    public ContractService(ApplicationDbContext context, INotificationService notification)
    {
        _context = context;
        _notification = notification;
    }

    // ══════════════════════════════════════════════════════════════════════════
    //  CONTRACT MANAGEMENT
    // ══════════════════════════════════════════════════════════════════════════

    public async Task<ContractDto?> GetContractByIdAsync(int contractId)
    {
        var c = await _context.Contracts
            .Include(x => x.Booking).ThenInclude(b => b!.Car).ThenInclude(car => car!.CarBrand)
            .Include(x => x.Customer).ThenInclude(u => u!.UserDetail)
            .Include(x => x.Supplier)
            .Include(x => x.ContractStatus)
            .Include(x => x.Car)
            .FirstOrDefaultAsync(x => x.ContractId == contractId && !x.IsDeleted);

        return c == null ? null : MapToDto(c);
    }

    public async Task<ContractDto?> GetContractByBookingIdAsync(int bookingId)
    {
        var c = await _context.Contracts
            .Include(x => x.Booking).ThenInclude(b => b!.Car).ThenInclude(car => car!.CarBrand)
            .Include(x => x.Customer).ThenInclude(u => u!.UserDetail)
            .Include(x => x.Supplier)
            .Include(x => x.ContractStatus)
            .Include(x => x.Car)
            .FirstOrDefaultAsync(x => x.BookingId == bookingId && !x.IsDeleted);

        return c == null ? null : MapToDto(c);
    }

    public async Task<IEnumerable<ContractListDto>> GetContractsBySupplierAsync(int supplierId)
    {
        var contracts = await _context.Contracts
            .Include(x => x.Customer)
            .Include(x => x.Car).ThenInclude(car => car!.CarBrand)
            .Include(x => x.ContractStatus)
            .Where(x => x.SupplierId == supplierId && !x.IsDeleted)
            .OrderByDescending(x => x.CreatedAt)
            .ToListAsync();

        return contracts.Select(c => new ContractListDto
        {
            ContractId = c.ContractId,
            BookingId = c.BookingId,
            ContractCode = c.ContractCode,
            CustomerName = c.Customer?.FullName ?? c.Customer?.Email,
            CarInfo = $"{c.Car?.CarBrand?.BrandName} {c.Car?.CarModel}",
            StartDate = c.StartDate,
            EndDate = c.EndDate,
            SignedByCustomer = c.SignedByCustomer,
            SignedBySupplier = c.SignedBySupplier,
            ContractStatusName = c.ContractStatus?.StatusName,
            ContractStatusId = c.ContractStatusId,
            CreatedAt = c.CreatedAt
        });
    }

    public async Task<IEnumerable<ContractListDto>> GetContractsByCustomerAsync(int customerId)
    {
        var contracts = await _context.Contracts
            .Include(x => x.Supplier)
            .Include(x => x.Car).ThenInclude(car => car!.CarBrand)
            .Include(x => x.ContractStatus)
            .Where(x => x.CustomerId == customerId && !x.IsDeleted)
            .OrderByDescending(x => x.CreatedAt)
            .ToListAsync();

        return contracts.Select(c => new ContractListDto
        {
            ContractId = c.ContractId,
            BookingId = c.BookingId,
            ContractCode = c.ContractCode,
            CustomerName = c.Supplier?.FullName ?? c.Supplier?.Email, // Show supplier name for customer view
            CarInfo = $"{c.Car?.CarBrand?.BrandName} {c.Car?.CarModel}",
            StartDate = c.StartDate,
            EndDate = c.EndDate,
            SignedByCustomer = c.SignedByCustomer,
            SignedBySupplier = c.SignedBySupplier,
            ContractStatusName = c.ContractStatus?.StatusName,
            ContractStatusId = c.ContractStatusId,
            CreatedAt = c.CreatedAt
        });
    }

    public async Task<ContractDto> GenerateContractAsync(int bookingId, int supplierId)
    {
        // Check if contract already exists
        var existing = await _context.Contracts
            .FirstOrDefaultAsync(c => c.BookingId == bookingId && !c.IsDeleted);
        if (existing != null)
            throw new InvalidOperationException("Hợp đồng đã được tạo cho booking này");

        var booking = await _context.Bookings
            .Include(b => b.Customer).ThenInclude(u => u!.UserDetail)
            .Include(b => b.Car).ThenInclude(c => c!.CarBrand)
            .Include(b => b.BookingFinancial)
            .FirstOrDefaultAsync(b => b.BookingId == bookingId && !b.IsDeleted)
            ?? throw new KeyNotFoundException("Booking không tồn tại");

        // Verify supplier owns the car
        if (booking.Car?.SupplierId != supplierId)
            throw new UnauthorizedAccessException("Bạn không phải chủ xe của booking này");

        var draftStatusId = 6; // draft
        var contractCode = $"HD-{DateTime.UtcNow:yyyyMMdd}-{bookingId:D5}";

        // Generate standard terms
        var terms = GenerateStandardTerms(booking);

        var contract = new Contract
        {
            BookingId = bookingId,
            ContractCode = contractCode,
            CustomerId = booking.CustomerId,
            SupplierId = supplierId,
            CarId = booking.CarId,
            DriverId = booking.DriverId,
            StartDate = DateOnly.FromDateTime(booking.StartDate),
            EndDate = DateOnly.FromDateTime(booking.EndDate),
            TermsAndConditions = terms,
            ContractStatusId = draftStatusId,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        await _context.Contracts.AddAsync(contract);
        await _context.SaveChangesAsync();

        // Notify customer
        try
        {
            await _notification.SendAsync(booking.CustomerId,
                $"Hợp đồng thuê xe #{contractCode} đã được tạo. Vui lòng kiểm tra và ký.",
                "contract", bookingId, "booking");
        }
        catch { /* ignore */ }

        return (await GetContractByIdAsync(contract.ContractId))!;
    }

    public async Task<ContractDto> SignContractAsync(int contractId, int userId, string signature)
    {
        var contract = await _context.Contracts
            .Include(c => c.Booking)
            .FirstOrDefaultAsync(c => c.ContractId == contractId && !c.IsDeleted)
            ?? throw new KeyNotFoundException("Hợp đồng không tồn tại");

        if (contract.ContractStatusId == 10) // terminated
            throw new InvalidOperationException("Hợp đồng đã bị hủy");

        bool isCustomer = contract.CustomerId == userId;
        bool isSupplier = contract.SupplierId == userId;

        if (!isCustomer && !isSupplier)
            throw new UnauthorizedAccessException("Bạn không có quyền ký hợp đồng này");

        // Supplier must verify customer license before signing
        if (isSupplier)
        {
            var customerDetail = await _context.UserDetails
                .FirstOrDefaultAsync(d => d.UserId == contract.CustomerId);
            if (customerDetail?.LicenseVerificationStatus != "verified")
                throw new InvalidOperationException(
                    "Bạn cần xác minh bằng lái khách hàng trước khi ký hợp đồng");
        }

        if (isCustomer)
        {
            if (contract.SignedByCustomer)
                throw new InvalidOperationException("Bạn đã ký hợp đồng này rồi");
            contract.CustomerSignature = signature;
        }
        else
        {
            if (contract.SignedBySupplier)
                throw new InvalidOperationException("Bạn đã ký hợp đồng này rồi");
            contract.SupplierSignature = signature;
        }

        // Update contract status based on signatures
        if (!string.IsNullOrEmpty(contract.CustomerSignature) &&
            !string.IsNullOrEmpty(contract.SupplierSignature))
        {
            contract.ContractStatusId = 8; // active - both signed
        }
        else
        {
            contract.ContractStatusId = 7; // signed - one party signed
        }

        contract.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        // Notify the other party
        try
        {
            int notifyUserId = isCustomer ? contract.SupplierId : contract.CustomerId;
            string signerName = isCustomer ? "Khách hàng" : "Chủ xe";
            await _notification.SendAsync(notifyUserId,
                $"{signerName} đã ký hợp đồng #{contract.ContractCode}",
                "contract", contract.BookingId, "booking");
        }
        catch { /* ignore */ }

        return (await GetContractByIdAsync(contractId))!;
    }

    public async Task<ContractDto> UpdateContractTermsAsync(int contractId, int supplierId, string terms)
    {
        var contract = await _context.Contracts
            .FirstOrDefaultAsync(c => c.ContractId == contractId && !c.IsDeleted)
            ?? throw new KeyNotFoundException("Hợp đồng không tồn tại");

        if (contract.SupplierId != supplierId)
            throw new UnauthorizedAccessException("Bạn không có quyền chỉnh sửa hợp đồng này");

        if (contract.ContractStatusId != 6) // only draft can be edited
            throw new InvalidOperationException("Chỉ có thể chỉnh sửa hợp đồng ở trạng thái nháp");

        contract.TermsAndConditions = terms;
        contract.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        return (await GetContractByIdAsync(contractId))!;
    }

    // ══════════════════════════════════════════════════════════════════════════
    //  LICENSE VERIFICATION
    // ══════════════════════════════════════════════════════════════════════════

    public async Task<LicenseInfoDto?> GetCustomerLicenseAsync(int customerId)
    {
        var user = await _context.Users
            .Include(u => u.UserDetail)
            .FirstOrDefaultAsync(u => u.UserId == customerId && !u.IsDeleted);

        if (user?.UserDetail == null) return null;

        return MapToLicenseDto(user);
    }

    public async Task<IEnumerable<LicenseVerificationListDto>> GetPendingLicenseVerificationsAsync(int supplierId)
    {
        // Get all bookings for this supplier where customer has uploaded license but not yet verified
        var bookings = await _context.Bookings
            .Include(b => b.Customer).ThenInclude(u => u!.UserDetail)
            .Include(b => b.Car).ThenInclude(c => c!.CarBrand)
            .Where(b => b.Car != null &&
                        b.Car.SupplierId == supplierId &&
                        !b.IsDeleted &&
                        b.Customer != null &&
                        b.Customer.UserDetail != null &&
                        b.Customer.UserDetail.DrivingLicense != null &&
                        (b.Customer.UserDetail.LicenseVerificationStatus == "unverified" ||
                         b.Customer.UserDetail.LicenseVerificationStatus == "pending"))
            .OrderByDescending(b => b.CreatedAt)
            .ToListAsync();

        // Deduplicate by customer (one customer may have multiple bookings)
        var seen = new HashSet<int>();
        var result = new List<LicenseVerificationListDto>();

        foreach (var b in bookings)
        {
            if (b.Customer == null || seen.Contains(b.CustomerId)) continue;
            seen.Add(b.CustomerId);

            result.Add(new LicenseVerificationListDto
            {
                UserId = b.CustomerId,
                FullName = b.Customer.FullName ?? b.Customer.Email,
                Email = b.Customer.Email,
                DrivingLicense = b.Customer.UserDetail?.DrivingLicense,
                DrivingLicenseFrontImage = b.Customer.UserDetail?.DrivingLicenseFrontImage,
                DrivingLicenseBackImage = b.Customer.UserDetail?.DrivingLicenseBackImage,
                LicenseVerificationStatus = b.Customer.UserDetail?.LicenseVerificationStatus ?? "unverified",
                BookingId = b.BookingId,
                CarInfo = $"{b.Car?.CarBrand?.BrandName} {b.Car?.CarModel}",
                BookingDate = b.CreatedAt
            });
        }

        return result;
    }

    public async Task<LicenseInfoDto> VerifyLicenseAsync(int customerId, int supplierId, VerifyLicenseRequest request)
    {
        var detail = await _context.UserDetails
            .FirstOrDefaultAsync(d => d.UserId == customerId)
            ?? throw new KeyNotFoundException("Không tìm thấy thông tin khách hàng");

        if (string.IsNullOrEmpty(detail.DrivingLicense) &&
            string.IsNullOrEmpty(detail.DrivingLicenseFrontImage))
            throw new InvalidOperationException("Khách hàng chưa upload bằng lái xe");

        if (request.Approved)
        {
            detail.LicenseVerificationStatus = "verified";
            detail.LicenseRejectionReason = null;
        }
        else
        {
            detail.LicenseVerificationStatus = "rejected";
            detail.LicenseRejectionReason = request.RejectionReason
                ?? "Bằng lái không hợp lệ hoặc ảnh không rõ ràng";
        }

        detail.LicenseVerifiedAt = DateTime.UtcNow;
        detail.LicenseVerifiedBy = supplierId;
        detail.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        // Notify customer
        try
        {
            string message = request.Approved
                ? "Bằng lái xe của bạn đã được xác minh thành công ✅"
                : $"Bằng lái xe bị từ chối: {detail.LicenseRejectionReason}. Vui lòng upload lại.";

            await _notification.SendAsync(customerId, message, "license_verification");
        }
        catch { /* ignore */ }

        var user = await _context.Users
            .Include(u => u.UserDetail)
            .FirstAsync(u => u.UserId == customerId);

        return MapToLicenseDto(user);
    }

    // ══════════════════════════════════════════════════════════════════════════
    //  HELPERS
    // ══════════════════════════════════════════════════════════════════════════

    private ContractDto MapToDto(Contract c)
    {
        LicenseInfoDto? licenseInfo = null;
        if (c.Customer?.UserDetail != null)
        {
            licenseInfo = MapToLicenseDto(c.Customer);
        }

        return new ContractDto
        {
            ContractId = c.ContractId,
            BookingId = c.BookingId,
            ContractCode = c.ContractCode,
            CustomerId = c.CustomerId,
            CustomerName = c.Customer?.FullName ?? c.Customer?.Email,
            CustomerEmail = c.Customer?.Email,
            CustomerPhone = c.Customer?.Phone,
            SupplierId = c.SupplierId,
            SupplierName = c.Supplier?.FullName ?? c.Supplier?.Email,
            CarId = c.CarId,
            CarModel = c.Car?.CarModel ?? c.Booking?.Car?.CarModel,
            CarBrand = c.Car?.CarBrand?.BrandName ?? c.Booking?.Car?.CarBrand?.BrandName,
            LicensePlate = c.Car?.LicensePlate,
            StartDate = c.StartDate,
            EndDate = c.EndDate,
            TermsAndConditions = c.TermsAndConditions,
            SignedByCustomer = c.SignedByCustomer,
            SignedBySupplier = c.SignedBySupplier,
            CustomerSignature = c.CustomerSignature,
            SupplierSignature = c.SupplierSignature,
            ContractStatusId = c.ContractStatusId,
            ContractStatusName = c.ContractStatus?.StatusName,
            CreatedAt = c.CreatedAt,
            UpdatedAt = c.UpdatedAt,
            CustomerLicense = licenseInfo
        };
    }

    private static LicenseInfoDto MapToLicenseDto(User user) => new()
    {
        UserId = user.UserId,
        FullName = user.FullName ?? user.Email,
        Email = user.Email,
        Phone = user.Phone,
        DrivingLicense = user.UserDetail?.DrivingLicense,
        DrivingLicenseFrontImage = user.UserDetail?.DrivingLicenseFrontImage,
        DrivingLicenseBackImage = user.UserDetail?.DrivingLicenseBackImage,
        NationalId = user.UserDetail?.NationalId,
        NationalIdFrontImage = user.UserDetail?.NationalIdFrontImage,
        NationalIdBackImage = user.UserDetail?.NationalIdBackImage,
        LicenseVerificationStatus = user.UserDetail?.LicenseVerificationStatus ?? "unverified",
        LicenseVerifiedAt = user.UserDetail?.LicenseVerifiedAt,
        LicenseVerifiedBy = user.UserDetail?.LicenseVerifiedBy,
        LicenseRejectionReason = user.UserDetail?.LicenseRejectionReason
    };

    private static string GenerateStandardTerms(Booking booking)
    {
        var car = booking.Car;
        var customer = booking.Customer;
        var totalPrice = booking.BookingFinancial?.TotalFare ?? 0;
        var days = Math.Max(1, (int)(booking.EndDate - booking.StartDate).TotalDays);

        return $@"HỢP ĐỒNG THUÊ XE TỰ LÁI

Mã đơn đặt: #{booking.BookingId}

ĐIỀU 1: THÔNG TIN CÁC BÊN
- Bên cho thuê (Supplier): Chủ sở hữu xe
- Bên thuê (Customer): {customer?.FullName ?? customer?.Email ?? "N/A"}

ĐIỀU 2: THÔNG TIN XE CHO THUÊ
- Xe: {car?.CarBrand?.BrandName} {car?.CarModel}
- Biển số: {car?.LicensePlate ?? "N/A"}
- Số chỗ: {car?.Seats ?? 0}
- Nhiên liệu: Theo thông số xe

ĐIỀU 3: THỜI GIAN & ĐỊA ĐIỂM
- Thời gian thuê: {booking.StartDate:dd/MM/yyyy} đến {booking.EndDate:dd/MM/yyyy} ({days} ngày)
- Địa điểm nhận xe: {booking.PickupLocation ?? "Theo thỏa thuận"}
- Địa điểm trả xe: {booking.DropoffLocation ?? "Theo thỏa thuận"}

ĐIỀU 4: GIÁ THUÊ & THANH TOÁN
- Giá thuê: {totalPrice:N0} VNĐ
- Phương thức: Theo quy định hệ thống

ĐIỀU 5: TRÁCH NHIỆM BÊN THUÊ
1. Sử dụng xe đúng mục đích, không vi phạm pháp luật
2. Bảo quản xe trong suốt thời gian thuê
3. Trả xe đúng hạn, đúng tình trạng
4. Chịu chi phí sửa chữa nếu có hư hỏng do lỗi người thuê
5. Không cho bên thứ ba mượn/sử dụng xe
6. Phải có bằng lái xe hợp lệ

ĐIỀU 6: TRÁCH NHIỆM BÊN CHO THUÊ  
1. Bàn giao xe đúng thời gian, đúng tình trạng
2. Cung cấp đầy đủ giấy tờ xe hợp lệ
3. Hỗ trợ kỹ thuật khi xe gặp sự cố (không do lỗi người thuê)
4. Hoàn tiền theo chính sách khi hủy hợp đồng

ĐIỀU 7: BỒI THƯỜNG & XỬ LÝ VI PHẠM
- Vi phạm hợp đồng: Bồi thường theo thiệt hại thực tế
- Trả xe trễ: Tính phí phát sinh theo ngày
- Hư hỏng xe: Đền bù theo biên bản kiểm tra

ĐIỀU 8: ĐIỀU KHOẢN CHUNG
- Hợp đồng có hiệu lực khi cả hai bên ký xác nhận
- Tranh chấp giải quyết theo pháp luật Việt Nam";
    }
}
