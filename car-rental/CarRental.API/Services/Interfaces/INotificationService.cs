using CarRental.API.DTOs.Common;

namespace CarRental.API.Services.Interfaces;

public interface INotificationService
{
    Task SendAsync(int userId, string message, string? type = null, int? entityId = null, string? entityType = null);
    Task<IEnumerable<NotificationDto>> GetByUserAsync(int userId);
    Task MarkAllReadAsync(int userId);
    Task<int> GetUnreadCountAsync(int userId);
}
