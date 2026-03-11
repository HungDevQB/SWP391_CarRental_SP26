using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CarRental.API.Models;

[Table("Status")]
public class Status
{
    [Key]
    [Column("status_id")]
    public int StatusId { get; set; }

    [Required]
    [MaxLength(50)]
    [Column("status_name")]
    public string StatusName { get; set; } = string.Empty;

    [MaxLength(200)]
    [Column("description")]
    public string? Description { get; set; }

    // Navigation
    public ICollection<Booking> Bookings { get; set; } = new List<Booking>();
    public ICollection<CarConditionReport> CarConditionReports { get; set; } = new List<CarConditionReport>();
}
