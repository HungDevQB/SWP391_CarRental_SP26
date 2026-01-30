using CarRental.API.Data;
using CarRental.API.Models;
using CarRental.API.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace CarRental.API.Repositories;

public class UserRepository : BaseRepository<User>, IUserRepository
{
    public UserRepository(ApplicationDbContext context) : base(context) { }

    public async Task<User?> GetByEmailAsync(string email) =>
        await _dbSet.Include(u => u.Role)
                    .Include(u => u.UserDetail)
                    .FirstOrDefaultAsync(u => u.Email == email);

    public async Task<User?> GetWithDetailAsync(int userId) =>
        await _dbSet.Include(u => u.Role)
                    .Include(u => u.UserDetail)
                    .Include(u => u.Language)
                    .FirstOrDefaultAsync(u => u.UserId == userId);

    public async Task<bool> EmailExistsAsync(string email) =>
        await _dbSet.AnyAsync(u => u.Email == email);

    public async Task<IEnumerable<User>> GetByRoleAsync(string roleName) =>
        await _dbSet.Include(u => u.Role)
                    .Where(u => u.Role != null && u.Role.RoleName == roleName)
                    .ToListAsync();

    public async Task<IEnumerable<User>> GetSuppliersAsync() =>
        await GetByRoleAsync("supplier");

    public async Task<IEnumerable<User>> GetCustomersAsync() =>
        await GetByRoleAsync("customer");

    public async Task<(IEnumerable<User> Items, int Total)> GetPagedAsync(int page, int size, string? search = null)
    {
        var query = _dbSet.Include(u => u.Role).AsQueryable();

        if (!string.IsNullOrEmpty(search))
            query = query.Where(u => u.Email.Contains(search) ||
                                     (u.FullName != null && u.FullName.Contains(search)));

        var total = await query.CountAsync();
        var items = await query.Skip(page * size).Take(size).ToListAsync();
        return (items, total);
    }
}
