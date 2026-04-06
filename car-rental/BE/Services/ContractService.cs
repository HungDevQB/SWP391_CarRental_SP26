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
    private readonly IEmailService _email;
    private readonly ILogger<ContractService> _logger;

    public ContractService(ApplicationDbContext context, INotificationService notification, IEmailService email, ILogger<ContractService> logger)
    {
        _context = context;
        _notification = notification;
        _email = email;
        _logger = logger;
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

    public async Task<ContractDto> EnsureContractAsync(int bookingId, int requestUserId)
    {
        // Return existing contract if found
        var existing = await _context.Contracts
            .FirstOrDefaultAsync(c => c.BookingId == bookingId && !c.IsDeleted);
        if (existing != null)
            return (await GetContractByIdAsync(existing.ContractId))!;

        // Verify requester is part of this booking (customer or supplier)
        var booking = await _context.Bookings
            .Include(b => b.Customer)
            .Include(b => b.Car).ThenInclude(c => c!.CarBrand)
            .Include(b => b.BookingFinancial)
            .FirstOrDefaultAsync(b => b.BookingId == bookingId && !b.IsDeleted)
            ?? throw new KeyNotFoundException("Booking không tồn tại");

        bool isCustomer = booking.CustomerId == requestUserId;
        bool isSupplier = booking.Car?.SupplierId == requestUserId;
        if (!isCustomer && !isSupplier)
            throw new UnauthorizedAccessException("Bạn không có quyền truy cập booking này");

        // Use the car's actual supplierId to generate
        var supplierId = booking.Car?.SupplierId ?? 0;
        return await GenerateContractAsync(bookingId, supplierId);
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

        // Load supplier info
        var supplier = await _context.Users
            .Include(u => u.UserDetail)
            .FirstOrDefaultAsync(u => u.UserId == supplierId);

        var draftStatusId = 6; // draft
        var contractCode = $"HD-{DateTime.UtcNow:yyyyMMdd}-{bookingId:D5}";

        // Generate standard terms
        var terms = GenerateStandardTerms(booking, supplier, contractCode);

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

        var carInfo = $"{booking.Car?.CarBrand?.BrandName} {booking.Car?.CarModel}".Trim();

        // Notify & email customer
        try
        {
            await _notification.SendAsync(booking.CustomerId,
                $"Hợp đồng thuê xe #{contractCode} đã được tạo. Vui lòng kiểm tra và ký.",
                "contract", bookingId, "booking");
        }
        catch { /* ignore */ }

        try
        {
            var customer = booking.Customer;
            if (!string.IsNullOrEmpty(customer?.Email))
                await _email.SendContractNotificationAsync(
                    customer.Email, customer.FullName ?? customer.Email,
                    contractCode, bookingId, carInfo, "customer", terms);
        }
        catch (Exception ex) { _logger.LogWarning(ex, "Failed to send contract email to customer for booking {BookingId}", bookingId); }

        // Notify & email supplier
        try
        {
            await _notification.SendAsync(supplierId,
                $"Hợp đồng #{contractCode} cho booking #{bookingId} đã được tạo.",
                "contract", bookingId, "booking");
        }
        catch (Exception ex) { _logger.LogWarning(ex, "Failed to send contract notification to supplier {SupplierId}", supplierId); }

        try
        {
            if (!string.IsNullOrEmpty(supplier?.Email))
                await _email.SendContractNotificationAsync(
                    supplier.Email, supplier.FullName ?? supplier.Email,
                    contractCode, bookingId, carInfo, "supplier", terms);
            else
                _logger.LogWarning("Supplier {SupplierId} has no email, skipping contract email", supplierId);
        }
        catch (Exception ex) { _logger.LogWarning(ex, "Failed to send contract email to supplier {SupplierId} for booking {BookingId}", supplierId, bookingId); }

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

    private static string GenerateStandardTerms(Booking booking, User? supplier, string contractCode)
    {
        var car = booking.Car;
        var customer = booking.Customer;
        var totalPrice = booking.BookingFinancial?.TotalFare ?? 0;
        var days = Math.Max(1, (int)(booking.EndDate - booking.StartDate).TotalDays);
        var pricePerDay = days > 0 ? totalPrice / days : totalPrice;
        var now = DateTime.Now;

        // Supplier info
        var supplierName   = supplier?.FullName ?? supplier?.Email ?? "Chủ xe";
        var supplierPhone  = supplier?.Phone ?? "................................";
        var supplierNationalId = supplier?.UserDetail?.NationalId ?? "................................";
        var supplierAddress = supplier?.UserDetail?.Address ?? "................................";

        // Customer info
        var customerName   = customer?.FullName ?? customer?.Email ?? "................................";
        var customerPhone  = customer?.Phone ?? "................................";
        var customerNationalId = customer?.UserDetail?.NationalId ?? "................................";
        var customerAddress = customer?.UserDetail?.Address ?? "................................";
        var customerLicense  = customer?.UserDetail?.DrivingLicense ?? "................................";

        // Car info
        var carBrand       = car?.CarBrand?.BrandName ?? "................................";
        var carModel       = car?.CarModel ?? "................................";
        var licensePlate   = car?.LicensePlate ?? "................................";
        var carColor       = car?.Color ?? "................................";
        var carYear        = car?.Year?.ToString() ?? "........";
        var carSeats       = car?.Seats?.ToString() ?? "..";

        return $@"CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM
Độc lập – Tự do – Hạnh phúc
────────────────────────────────────────

HỢP ĐỒNG THUÊ XE Ô TÔ TỰ LÁI
Số hợp đồng: {contractCode}

Hôm nay, ngày {now.Day:D2} tháng {now.Month:D2} năm {now.Year}, hai bên gồm:

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
BÊN CHO THUÊ (BÊN A):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Họ và tên       : {supplierName}
CCCD/CMND số    : {supplierNationalId}
Địa chỉ         : {supplierAddress}
Số điện thoại   : {supplierPhone}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
BÊN THUÊ (BÊN B):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Họ và tên       : {customerName}
CCCD/CMND số    : {customerNationalId}
Giấy phép lái xe: {customerLicense}
Địa chỉ         : {customerAddress}
Số điện thoại   : {customerPhone}

Sau khi thống nhất, hai bên ký kết hợp đồng với các điều khoản sau:

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ĐIỀU 1: ĐẶC ĐIỂM TÀI SẢN THUÊ
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Bên A đồng ý cho Bên B thuê 01 xe ô tô với thông tin:

  Nhãn hiệu       : {carBrand} {carModel}
  Năm sản xuất    : {carYear}
  Biển kiểm soát  : {licensePlate}
  Màu sơn         : {carColor}
  Số chỗ ngồi     : {carSeats} chỗ

Giấy tờ kèm theo xe:
  - Bản sao công chứng Giấy đăng ký xe
  - Giấy chứng nhận kiểm định (bản gốc)
  - Giấy chứng nhận bảo hiểm TNDS (bản gốc)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ĐIỀU 2: THỜI HẠN VÀ GIÁ THUÊ XE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Thời gian thuê  : Từ {booking.StartDate:HH:mm dd/MM/yyyy} đến {booking.EndDate:HH:mm dd/MM/yyyy}
  Số ngày thuê    : {days} ngày
  Giá thuê        : {pricePerDay:N0} VNĐ/ngày
  Tổng tiền thuê  : {totalPrice:N0} VNĐ
  Địa điểm nhận xe: {booking.PickupLocation ?? "Theo thỏa thuận"}
  Địa điểm trả xe : {booking.DropoffLocation ?? "Theo thỏa thuận"}
  Chi phí trả trễ : 50.000 VNĐ/giờ phát sinh

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ĐIỀU 3: PHƯƠNG THỨC THANH TOÁN & ĐẶT CỌC
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Tiền thuê xe : {totalPrice:N0} VNĐ – thanh toán qua hệ thống khi đặt xe
  Tiền đặt cọc : 5.000.000 VNĐ – hoàn trả sau khi trả xe nguyên vẹn
  Phương thức  : Thanh toán online (Stripe) hoặc tiền mặt khi nhận xe

Tiền cọc và tài sản thế chấp được hoàn trả sau khi Bên B bàn giao xe
và thanh toán đầy đủ các chi phí phát sinh (nếu có).

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ĐIỀU 4: TRÁCH NHIỆM CỦA CÁC BÊN
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
4.1. Trách nhiệm của Bên A (Bên cho thuê):
  1. Giao xe và giấy tờ đúng thời gian, địa điểm, tình trạng thỏa thuận
  2. Chịu trách nhiệm pháp lý về nguồn gốc và quyền sở hữu xe
  3. Hỗ trợ kỹ thuật khi xe gặp sự cố không do lỗi người thuê
  4. Hoàn tiền theo chính sách khi hủy hợp đồng hợp lệ

4.2. Trách nhiệm của Bên B (Bên thuê):
  1. Sử dụng xe đúng mục đích, không vi phạm pháp luật
  2. Không chở hàng cấm, vũ khí, chất cháy nổ
  3. Không cầm cố, thế chấp hoặc cho thuê lại xe dưới bất kỳ hình thức nào
  4. Tự chi trả: xăng dầu, phí cầu đường, bến bãi trong thời gian thuê
  5. Chịu toàn bộ trách nhiệm dân sự, hình sự và nộp phạt vi phạm giao thông
     (kể cả phạt nguội) phát sinh trong thời gian thuê xe
  6. Trả xe đúng hạn, đúng địa điểm và đúng tình trạng ban đầu
  7. Phải có bằng lái xe hợp lệ, phù hợp chủng loại xe

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ĐIỀU 5: BỒI THƯỜNG & XỬ LÝ VI PHẠM
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  - Nếu xe bị hư hỏng do lỗi Bên B: bồi thường 100% chi phí sửa chữa
    chính hãng và chi trả tiền thuê cho những ngày xe nằm gara
  - Trả xe trễ: tính phí 50.000 VNĐ/giờ kể từ thời điểm hết hạn
  - Vi phạm giao thông: Bên B chịu hoàn toàn, Bên A không chịu trách nhiệm
  - Mất mát tài sản trên xe: Bên B chịu trách nhiệm bồi thường

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ĐIỀU 6: ĐIỀU KHOẢN CHUNG
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  - Hợp đồng có hiệu lực kể từ khi cả hai bên xác nhận chữ ký điện tử
  - Chữ ký điện tử trên hệ thống có giá trị pháp lý tương đương chữ ký tay
  - Hợp đồng được lập thành 02 bản (01 bản lưu hệ thống, 01 bản gửi email)
  - Tranh chấp phát sinh: ưu tiên thương lượng; nếu không thành, đưa ra
    Tòa án nhân dân có thẩm quyền tại Việt Nam để giải quyết

────────────────────────────────────────
        ĐẠI DIỆN BÊN A                    ĐẠI DIỆN BÊN B
   (Ký tên – Chủ xe/Nhà cung cấp)      (Ký tên – Người thuê xe)

   {supplierName}                        {customerName}";
    }
}
