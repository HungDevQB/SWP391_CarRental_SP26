using CarRental.API.DTOs.Booking;
using CarRental.API.DTOs.Common;

namespace CarRental.API.Services.Interfaces;

public interface IContractService
{
    // ── Contract ─────────────────────────────────────────────────────────────
    Task<ContractDto?> GetContractByIdAsync(int contractId);
    Task<ContractDto?> GetContractByBookingIdAsync(int bookingId);
    Task<IEnumerable<ContractListDto>> GetContractsBySupplierAsync(int supplierId);
    Task<IEnumerable<ContractListDto>> GetContractsByCustomerAsync(int customerId);
    Task<ContractDto> GenerateContractAsync(int bookingId, int supplierId);
    Task<ContractDto> EnsureContractAsync(int bookingId, int requestUserId);
    Task<ContractDto> SignContractAsync(int contractId, int userId, string signature);
    Task<ContractDto> UpdateContractTermsAsync(int contractId, int supplierId, string terms);

    // ── License Verification ─────────────────────────────────────────────────
    Task<LicenseInfoDto?> GetCustomerLicenseAsync(int customerId);
    Task<IEnumerable<LicenseVerificationListDto>> GetPendingLicenseVerificationsAsync(int supplierId);
    Task<LicenseInfoDto> VerifyLicenseAsync(int customerId, int supplierId, VerifyLicenseRequest request);
}
