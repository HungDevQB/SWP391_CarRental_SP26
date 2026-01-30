using CarRental.API.Data;
using CarRental.API.Models;
using CarRental.API.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace CarRental.API.Repositories;

public class NotificationRepository : BaseRepository<Notification>, INotificationRepository
{
    public NotificationRepository(ApplicationDbContext context) : base(context) { }

    public async Task<IEnumerable<Notification>> GetByUserAsync(int userId) =>
        await _dbSet.Where(n => n.UserId == userId)
                    .OrderByDescending(n => n.CreatedAt)
                    .ToListAsync();

    public async Task MarkAllReadAsync(int userId)
    {
        var notifications = await _dbSet.Where(n => n.UserId == userId && !n.IsRead).ToListAsync();
        notifications.ForEach(n => n.IsRead = true);
        await _context.SaveChangesAsync();
    }

    public async Task<int> GetUnreadCountAsync(int userId) =>
        await _dbSet.CountAsync(n => n.UserId == userId && !n.IsRead);
}
