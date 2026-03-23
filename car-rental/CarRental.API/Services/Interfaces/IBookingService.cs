using CarRental.API.DTOs.Booking;
using CarRental.API.DTOs.Common;

namespace CarRental.API.Services.Interfaces;

public interface IBookingService
{
    Task<BookingDto?> GetByIdAsync(int bookingId);
    Task<PageResponse<BookingListDto>> GetAllAsync(int page, int size, int? statusId = null);
    Task<IEnumerable<BookingListDto>> GetByCustomerAsync(int customerId);
    Task<IEnumerable<BookingListDto>> GetBySupplierAsync(int supplierId);
    Task<BookingDto> CreateAsync(int customerId, CreateBookingRequest request);
    Task<bool> UpdateStatusAsync(int bookingId, int statusId, int actorId);
    Task<CancellationDto> CancelAsync(int bookingId, int cancelledBy, string? reason);
    Task<ContractDto?> GetContractAsync(int bookingId);
    Task<bool> SignContractAsync(int bookingId, int userId);
    Task<BookingFinancialDto?> GetFinancialAsync(int bookingId);
    Task<DepositDto?> GetDepositAsync(int bookingId);
}
