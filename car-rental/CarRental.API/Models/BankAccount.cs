using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CarRental.API.Models;

[Table("BankAccount")]
public class BankAccount
{
    [Key]
    [Column("bank_account_id")]
    public int BankAccountId { get; set; }

    [Column("user_id")]
    public int UserId { get; set; }

    [Required]
    [MaxLength(50)]
    [Column("account_number")]
    public string AccountNumber { get; set; } = string.Empty;

    [Required]
    [MaxLength(100)]
    [Column("account_holder_name")]
    public string AccountHolderName { get; set; } = string.Empty;

    [Required]
    [MaxLength(100)]
    [Column("bank_name")]
    public string BankName { get; set; } = string.Empty;

    [MaxLength(100)]
    [Column("bank_branch")]
    public string? BankBranch { get; set; }

    [MaxLength(20)]
    [Column("swift_code")]
    public string? SwiftCode { get; set; }

    [MaxLength(20)]
    [Column("routing_number")]
    public string? RoutingNumber { get; set; }

    [MaxLength(20)]
    [Column("account_type")]
    public string AccountType { get; set; } = "checking";

    [Column("is_primary")]
    public bool IsPrimary { get; set; } = false;

    [Column("is_verified")]
    public bool IsVerified { get; set; } = false;

    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [Column("updated_at")]
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    [Column("is_deleted")]
    public bool IsDeleted { get; set; } = false;

    // Navigation
    [ForeignKey("UserId")]
    public User? User { get; set; }
}
