// FavoriteRepository - user saved cars management
using CarRental.API.Data;
using CarRental.API.Models;
using CarRental.API.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace CarRental.API.Repositories;

public class FavoriteRepository : BaseRepository<Favorite>, IFavoriteRepository
{
    public FavoriteRepository(ApplicationDbContext context) : base(context) { }

    public async Task<IEnumerable<Favorite>> GetByUserAsync(int userId) =>
        await _dbSet.Include(f => f.Car).ThenInclude(c => c!.CarBrand)
                    .Include(f => f.Car).ThenInclude(c => c!.Images)
                    .Where(f => f.UserId == userId)
                    .OrderByDescending(f => f.CreatedAt)
                    .ToListAsync();

    public async Task<bool> IsFavoriteAsync(int userId, int carId) =>
        await _dbSet.AnyAsync(f => f.UserId == userId && f.CarId == carId);

    public async Task<Favorite?> GetByUserAndCarAsync(int userId, int carId) =>
        await _dbSet.FirstOrDefaultAsync(f => f.UserId == userId && f.CarId == carId);
}
