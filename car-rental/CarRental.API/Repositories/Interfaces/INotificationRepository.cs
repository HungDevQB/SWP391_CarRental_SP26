using CarRental.API.Models;

namespace CarRental.API.Repositories.Interfaces;

public interface INotificationRepository : IBaseRepository<Notification>
{
    Task<IEnumerable<Notification>> GetByUserAsync(int userId);
    Task MarkAllReadAsync(int userId);
    Task<int> GetUnreadCountAsync(int userId);
}
