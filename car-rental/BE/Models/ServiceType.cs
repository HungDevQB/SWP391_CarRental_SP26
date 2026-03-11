using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CarRental.API.Models;

[Table("ServiceType")]
public class ServiceType
{
    [Key]
    [Column("service_type_id")]
    public int ServiceTypeId { get; set; }

    [Required]
    [MaxLength(100)]
    [Column("name")]
    public string Name { get; set; } = string.Empty;

    [MaxLength(500)]
    [Column("description")]
    public string? Description { get; set; }

    [Column("is_deleted")]
    public bool IsDeleted { get; set; } = false;

    // Navigation
    public ICollection<SignUpToProvide> SignUpToProvides { get; set; } = new List<SignUpToProvide>();
}
