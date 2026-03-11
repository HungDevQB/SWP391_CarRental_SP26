using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CarRental.API.Models;

[Table("Rating")]
public class Rating
{
    [Key]
    [Column("rating_id")]
    public int RatingId { get; set; }

    [Column("booking_id")]
    public int BookingId { get; set; }

    [Column("customer_id")]
    public int CustomerId { get; set; }

    [Column("car_id")]
    public int CarId { get; set; }

    [Column("rating_score")]
    public byte RatingScore { get; set; }

    [MaxLength(1000)]
    [Column("comment")]
    public string? Comment { get; set; }

    [Column("rating_date")]
    public DateTime RatingDate { get; set; } = DateTime.UtcNow;

    [Column("is_deleted")]
    public bool IsDeleted { get; set; } = false;

    // Navigation
    [ForeignKey("BookingId")]
    public Booking? Booking { get; set; }

    [ForeignKey("CustomerId")]
    public User? Customer { get; set; }

    [ForeignKey("CarId")]
    public Car? Car { get; set; }
}
