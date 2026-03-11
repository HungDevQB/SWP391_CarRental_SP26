using System.Linq.Expressions;
using CarRental.API.Data;
using CarRental.API.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace CarRental.API.Repositories;

public class BaseRepository<T> : IBaseRepository<T> where T : class
{
    protected readonly ApplicationDbContext _context;
    protected readonly DbSet<T> _dbSet;

    public BaseRepository(ApplicationDbContext context)
    {
        _context = context;
        _dbSet = context.Set<T>();
    }

    public virtual async Task<T?> GetByIdAsync(int id) =>
        await _dbSet.FindAsync(id);

    public virtual async Task<IEnumerable<T>> GetAllAsync() =>
        await _dbSet.ToListAsync();

    public virtual async Task<IEnumerable<T>> FindAsync(Expression<Func<T, bool>> predicate) =>
        await _dbSet.Where(predicate).ToListAsync();

    public virtual async Task<T?> FirstOrDefaultAsync(Expression<Func<T, bool>> predicate) =>
        await _dbSet.FirstOrDefaultAsync(predicate);

    public virtual async Task AddAsync(T entity) =>
        await _dbSet.AddAsync(entity);

    public virtual async Task AddRangeAsync(IEnumerable<T> entities) =>
        await _dbSet.AddRangeAsync(entities);

    public virtual void Update(T entity) =>
        _dbSet.Update(entity);

    public virtual void Remove(T entity) =>
        _dbSet.Remove(entity);

    public virtual void RemoveRange(IEnumerable<T> entities) =>
        _dbSet.RemoveRange(entities);

    public virtual async Task<int> CountAsync(Expression<Func<T, bool>>? predicate = null) =>
        predicate == null
            ? await _dbSet.CountAsync()
            : await _dbSet.CountAsync(predicate);

    public virtual async Task<bool> ExistsAsync(Expression<Func<T, bool>> predicate) =>
        await _dbSet.AnyAsync(predicate);

    public virtual IQueryable<T> Query() =>
        _dbSet.AsQueryable();

    public async Task SaveChangesAsync() =>
        await _context.SaveChangesAsync();
}
