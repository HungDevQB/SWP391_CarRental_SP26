using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CarRental.API.Models;

[Table("CarConditionImage")]
public class CarConditionImage
{
    [Key]
    [Column("image_id")]
    public int ImageId { get; set; }

    [Column("report_id")]
    public int ReportId { get; set; }

    [Required]
    [MaxLength(500)]
    [Column("image_url")]
    public string ImageUrl { get; set; } = string.Empty;

    [MaxLength(50)]
    [Column("image_type")]
    public string? ImageType { get; set; }

    [MaxLength(255)]
    [Column("description")]
    public string? Description { get; set; }

    [Column("upload_date")]
    public DateTime UploadDate { get; set; } = DateTime.UtcNow;

    [Column("is_deleted")]
    public bool IsDeleted { get; set; } = false;

    // Navigation
    [ForeignKey("ReportId")]
    public CarConditionReport? CarConditionReport { get; set; }
}
