using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CarRental.API.Models;

[Table("Role")]
public class Role
{
    [Key]
    [Column("role_id")]
    public int RoleId { get; set; }

    [Required]
    [MaxLength(50)]
    [Column("role_name")]
    public string RoleName { get; set; } = string.Empty;

    [MaxLength(200)]
    [Column("description")]
    public string? Description { get; set; }

    // Navigation
    public ICollection<User> Users { get; set; } = new List<User>();
}
