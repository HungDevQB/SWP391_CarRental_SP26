using CarRental.API.Models;

namespace CarRental.API.Repositories.Interfaces;

public interface IUserRepository : IBaseRepository<User>
{
    Task<User?> GetByEmailAsync(string email);
    Task<User?> GetWithDetailAsync(int userId);
    Task<bool> EmailExistsAsync(string email);
    Task<IEnumerable<User>> GetByRoleAsync(string roleName);
    Task<IEnumerable<User>> GetSuppliersAsync();
    Task<IEnumerable<User>> GetCustomersAsync();
    Task<(IEnumerable<User> Items, int Total)> GetPagedAsync(int page, int size, string? search = null);
}
