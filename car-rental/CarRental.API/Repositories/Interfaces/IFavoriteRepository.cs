using CarRental.API.Models;

namespace CarRental.API.Repositories.Interfaces;

public interface IFavoriteRepository : IBaseRepository<Favorite>
{
    Task<IEnumerable<Favorite>> GetByUserAsync(int userId);
    Task<bool> IsFavoriteAsync(int userId, int carId);
    Task<Favorite?> GetByUserAndCarAsync(int userId, int carId);
}
