// NotificationService - real-time push notifications
using CarRental.API.Data;
using CarRental.API.DTOs.Common;
using CarRental.API.Models;
using CarRental.API.Repositories.Interfaces;
using CarRental.API.Services.Interfaces;

namespace CarRental.API.Services;

public class NotificationService : INotificationService
{
    private readonly INotificationRepository _notificationRepo;
    private readonly ApplicationDbContext _context;

    public NotificationService(INotificationRepository notificationRepo, ApplicationDbContext context)
    {
        _notificationRepo = notificationRepo;
        _context = context;
    }

    public async Task SendAsync(int userId, string message, string? type = null, int? entityId = null, string? entityType = null)
    {
        // type must be one of: 'email', 'in_app', 'chatbox'
        var validType = type is "email" or "in_app" or "chatbox" ? type : "in_app";
        var notification = new Notification
        {
            UserId = userId,
            Message = message,
            Type = validType,
            StatusId = 1
        };
        await _notificationRepo.AddAsync(notification);
        await _notificationRepo.SaveChangesAsync();
    }

    public async Task<IEnumerable<NotificationDto>> GetByUserAsync(int userId)
    {
        var items = await _notificationRepo.GetByUserAsync(userId);
        return items.Select(n => new NotificationDto
        {
            NotificationId = n.NotificationId,
            UserId = n.UserId,
            Message = n.Message,
            Type = n.Type,
            CreatedAt = n.CreatedAt
        });
    }

    public async Task MarkAllReadAsync(int userId) =>
        await _notificationRepo.MarkAllReadAsync(userId);

    public async Task<int> GetUnreadCountAsync(int userId) =>
        await _notificationRepo.GetUnreadCountAsync(userId);
}
