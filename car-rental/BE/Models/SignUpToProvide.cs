using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CarRental.API.Models;

[Table("SignUpToProvide")]
public class SignUpToProvide
{
    [Key]
    [Column("id")]
    public int Id { get; set; }

    [Column("user_id")]
    public int UserId { get; set; }

    [Column("car_id")]
    public int? CarId { get; set; }

    [Column("service_type_id")]
    public int? ServiceTypeId { get; set; }

    [MaxLength(20)]
    [Column("status")]
    public string Status { get; set; } = "pending";

    [Column("submitted_at")]
    public DateTime? SubmittedAt { get; set; }

    [Column("approved_at")]
    public DateTime? ApprovedAt { get; set; }

    [Column("rejected_at")]
    public DateTime? RejectedAt { get; set; }

    [MaxLength(500)]
    [Column("rejection_reason")]
    public string? RejectionReason { get; set; }

    [Column("is_deleted")]
    public bool IsDeleted { get; set; } = false;

    // Navigation
    [ForeignKey("UserId")]
    public User? User { get; set; }

    [ForeignKey("CarId")]
    public Car? Car { get; set; }

    [ForeignKey("ServiceTypeId")]
    public ServiceType? ServiceType { get; set; }
}
