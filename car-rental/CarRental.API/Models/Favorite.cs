using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CarRental.API.Models;

[Table("Favorite")]
public class Favorite
{
    [Key]
    [Column("favorite_id")]
    public int FavoriteId { get; set; }

    [Column("user_id")]
    public int UserId { get; set; }

    [Column("car_id")]
    public int CarId { get; set; }

    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [Column("is_deleted")]
    public bool IsDeleted { get; set; } = false;

    // Navigation
    [ForeignKey("UserId")]
    public User? User { get; set; }

    [ForeignKey("CarId")]
    public Car? Car { get; set; }
}
