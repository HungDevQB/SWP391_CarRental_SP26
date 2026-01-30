using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CarRental.API.Models;

[Table("SystemConfiguration")]
public class SystemConfiguration
{
    [Key]
    [Column("config_id")]
    public int ConfigId { get; set; }

    [Required]
    [MaxLength(100)]
    [Column("config_key")]
    public string ConfigKey { get; set; } = string.Empty;

    [MaxLength(500)]
    [Column("config_value")]
    public string? ConfigValue { get; set; }

    [MaxLength(500)]
    [Column("description")]
    public string? Description { get; set; }

    [Column("last_updated")]
    public DateTime LastUpdated { get; set; } = DateTime.UtcNow;
}
