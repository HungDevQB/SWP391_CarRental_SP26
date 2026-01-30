using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CarRental.API.Models;

[Table("User")]
public class User
{
    [Key]
    [Column("user_id")]
    public int UserId { get; set; }

    [Column("role_id")]
    public int RoleId { get; set; }

    [Required]
    [MaxLength(100)]
    [Column("email")]
    public string Email { get; set; } = string.Empty;

    [MaxLength(20)]
    [Column("phone")]
    public string? Phone { get; set; }

    [MaxLength(10)]
    [Column("country_code")]
    public string? CountryCode { get; set; }

    [MaxLength(255)]
    [Column("password_hash")]
    public string? PasswordHash { get; set; }

    [MaxLength(100)]
    [Column("full_name")]
    public string? FullName { get; set; }

    [MaxLength(500)]
    [Column("avatar_url")]
    public string? AvatarUrl { get; set; }

    [Column("is_active")]
    public bool IsActive { get; set; } = true;

    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [Column("updated_at")]
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    [MaxLength(50)]
    [Column("login_source")]
    public string? LoginSource { get; set; }

    [Column("language_id")]
    public int? LanguageId { get; set; }

    // Navigation
    [ForeignKey("RoleId")]
    public Role? Role { get; set; }

    [ForeignKey("LanguageId")]
    public Language? Language { get; set; }

    public UserDetail? UserDetail { get; set; }
    public ICollection<Car> Cars { get; set; } = new List<Car>();
    public ICollection<Booking> Bookings { get; set; } = new List<Booking>();
    public ICollection<Driver> Drivers { get; set; } = new List<Driver>();
    public ICollection<Notification> Notifications { get; set; } = new List<Notification>();
    public ICollection<ChatMessage> SentMessages { get; set; } = new List<ChatMessage>();
    public ICollection<ChatMessage> ReceivedMessages { get; set; } = new List<ChatMessage>();
    public ICollection<Favorite> Favorites { get; set; } = new List<Favorite>();
    public ICollection<BankAccount> BankAccounts { get; set; } = new List<BankAccount>();
    public ICollection<UserSession> UserSessions { get; set; } = new List<UserSession>();
    public ICollection<UserActionLog> UserActionLogs { get; set; } = new List<UserActionLog>();
    public ICollection<RegistrationRequest> RegistrationRequests { get; set; } = new List<RegistrationRequest>();
    public ICollection<SignUpToProvide> SignUpToProvides { get; set; } = new List<SignUpToProvide>();
    public ICollection<SupplierRevenue> SupplierRevenues { get; set; } = new List<SupplierRevenue>();
    public ICollection<CashPaymentConfirmation> CashPaymentConfirmations { get; set; } = new List<CashPaymentConfirmation>();
    public ICollection<Rating> Ratings { get; set; } = new List<Rating>();
}
