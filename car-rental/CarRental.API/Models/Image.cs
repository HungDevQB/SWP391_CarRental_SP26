using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CarRental.API.Models;

[Table("Image")]
public class Image
{
    [Key]
    [Column("image_id")]
    public int ImageId { get; set; }

    [Column("car_id")]
    public int CarId { get; set; }

    [Required]
    [MaxLength(500)]
    [Column("image_url")]
    public string ImageUrl { get; set; } = string.Empty;

    [MaxLength(50)]
    [Column("image_type")]
    public string? ImageType { get; set; }

    [Column("is_deleted")]
    public bool IsDeleted { get; set; } = false;

    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation
    [ForeignKey("CarId")]
    public Car? Car { get; set; }
}
