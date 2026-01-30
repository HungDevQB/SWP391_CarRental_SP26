using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CarRental.API.Models;

[Table("CountryCode")]
public class CountryCode
{
    [Key]
    [Column("country_code_id")]
    public int CountryCodeId { get; set; }

    [Required]
    [MaxLength(10)]
    [Column("country_code")]
    public string Code { get; set; } = string.Empty;

    [MaxLength(100)]
    [Column("country_name")]
    public string? CountryName { get; set; }

    // Navigation
    public ICollection<User> Users { get; set; } = new List<User>();
}
