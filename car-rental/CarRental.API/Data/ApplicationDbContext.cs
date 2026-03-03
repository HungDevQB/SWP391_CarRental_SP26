using CarRental.API.Models;
using Microsoft.EntityFrameworkCore;

namespace CarRental.API.Data;

public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options) { }

    // ── Lookup tables ──────────────────────────────────────────────────────────
    public DbSet<CountryCode> CountryCodes { get; set; }
    public DbSet<Language> Languages { get; set; }
    public DbSet<Role> Roles { get; set; }
    public DbSet<Status> Statuses { get; set; }
    public DbSet<FuelType> FuelTypes { get; set; }
    public DbSet<CarBrand> CarBrands { get; set; }
    public DbSet<FeeLevel> FeeLevels { get; set; }
    public DbSet<ServiceType> ServiceTypes { get; set; }
    public DbSet<Tax> Taxes { get; set; }
    public DbSet<SystemConfiguration> SystemConfigurations { get; set; }
    public DbSet<Region> Regions { get; set; }

    // ── User domain ────────────────────────────────────────────────────────────
    public DbSet<User> Users { get; set; }
    public DbSet<UserDetail> UserDetails { get; set; }
    public DbSet<UserSession> UserSessions { get; set; }
    public DbSet<UserActionLog> UserActionLogs { get; set; }
    public DbSet<RegistrationRequest> RegistrationRequests { get; set; }
    public DbSet<PhoneOtp> PhoneOtps { get; set; }
    public DbSet<BankAccount> BankAccounts { get; set; }

    // ── Car domain ─────────────────────────────────────────────────────────────
    public DbSet<Car> Cars { get; set; }
    public DbSet<Image> Images { get; set; }
    public DbSet<Driver> Drivers { get; set; }
    public DbSet<Insurance> Insurances { get; set; }
    public DbSet<Maintenance> Maintenances { get; set; }

    // ── Booking domain ─────────────────────────────────────────────────────────
    public DbSet<Booking> Bookings { get; set; }
    public DbSet<BookingFinancial> BookingFinancials { get; set; }
    public DbSet<BookingTax> BookingTaxes { get; set; }
    public DbSet<Deposit> Deposits { get; set; }
    public DbSet<Contract> Contracts { get; set; }
    public DbSet<Cancellation> Cancellations { get; set; }
    public DbSet<CarConditionReport> CarConditionReports { get; set; }
    public DbSet<CarConditionImage> CarConditionImages { get; set; }

    // ── Payment domain ─────────────────────────────────────────────────────────
    public DbSet<Payment> Payments { get; set; }
    public DbSet<CashPaymentConfirmation> CashPaymentConfirmations { get; set; }
    public DbSet<SupplierRevenue> SupplierRevenues { get; set; }

    // ── Social / misc ──────────────────────────────────────────────────────────
    public DbSet<Rating> Ratings { get; set; }
    public DbSet<Promotion> Promotions { get; set; }
    public DbSet<Notification> Notifications { get; set; }
    public DbSet<ChatMessage> ChatMessages { get; set; }
    public DbSet<ChatMessageImage> ChatMessageImages { get; set; }
    public DbSet<Favorite> Favorites { get; set; }
    public DbSet<SignUpToProvide> SignUpToProvides { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // ── Global soft-delete query filters ─────────────────────────────────
        modelBuilder.Entity<Car>().HasQueryFilter(e => !e.IsDeleted);
        modelBuilder.Entity<User>().HasQueryFilter(e => !e.IsDeleted);
        modelBuilder.Entity<Booking>().HasQueryFilter(e => !e.IsDeleted);
        modelBuilder.Entity<Payment>().HasQueryFilter(e => !e.IsDeleted);
        modelBuilder.Entity<Rating>().HasQueryFilter(e => !e.IsDeleted);
        modelBuilder.Entity<Favorite>().HasQueryFilter(e => !e.IsDeleted);
        modelBuilder.Entity<ChatMessage>().HasQueryFilter(e => !e.IsDeleted);
        modelBuilder.Entity<ChatMessageImage>().HasQueryFilter(e => !e.IsDeleted);
        modelBuilder.Entity<Notification>().HasQueryFilter(e => !e.IsDeleted);
        modelBuilder.Entity<Driver>().HasQueryFilter(e => !e.IsDeleted);
        modelBuilder.Entity<Maintenance>().HasQueryFilter(e => !e.IsDeleted);
        modelBuilder.Entity<Insurance>().HasQueryFilter(e => !e.IsDeleted);
        modelBuilder.Entity<Cancellation>().HasQueryFilter(e => !e.IsDeleted);
        modelBuilder.Entity<Contract>().HasQueryFilter(e => !e.IsDeleted);
        modelBuilder.Entity<Deposit>().HasQueryFilter(e => !e.IsDeleted);
        modelBuilder.Entity<BookingFinancial>().HasQueryFilter(e => !e.IsDeleted);
        modelBuilder.Entity<BookingTax>().HasQueryFilter(e => !e.IsDeleted);
        modelBuilder.Entity<SupplierRevenue>().HasQueryFilter(e => !e.IsDeleted);
        modelBuilder.Entity<BankAccount>().HasQueryFilter(e => !e.IsDeleted);
        // RegistrationRequest has no IsDeleted column
        modelBuilder.Entity<CashPaymentConfirmation>().HasQueryFilter(e => !e.IsDeleted);
        modelBuilder.Entity<CarConditionReport>().HasQueryFilter(e => !e.IsDeleted);
        modelBuilder.Entity<CarConditionImage>().HasQueryFilter(e => !e.IsDeleted);
        modelBuilder.Entity<SignUpToProvide>().HasQueryFilter(e => !e.IsDeleted);
        modelBuilder.Entity<Promotion>().HasQueryFilter(e => !e.IsDeleted);
        modelBuilder.Entity<Image>().HasQueryFilter(e => !e.IsDeleted);
        modelBuilder.Entity<FuelType>().HasQueryFilter(e => !e.IsDeleted);
        modelBuilder.Entity<CarBrand>().HasQueryFilter(e => !e.IsDeleted);
        modelBuilder.Entity<FeeLevel>().HasQueryFilter(e => !e.IsDeleted);
        modelBuilder.Entity<ServiceType>().HasQueryFilter(e => !e.IsDeleted);
        modelBuilder.Entity<Tax>().HasQueryFilter(e => !e.IsDeleted);
        modelBuilder.Entity<Region>().HasQueryFilter(e => !e.IsDeleted);

        // ── Disable OUTPUT clause for tables with triggers (SQL Server limitation) ──
        modelBuilder.Entity<Booking>().ToTable(t => t.UseSqlOutputClause(false));
        modelBuilder.Entity<User>().ToTable(t => t.UseSqlOutputClause(false));
        modelBuilder.Entity<Car>().ToTable(t => t.UseSqlOutputClause(false));
        modelBuilder.Entity<BankAccount>().ToTable(t => t.UseSqlOutputClause(false));
        modelBuilder.Entity<RegistrationRequest>().ToTable(t => t.UseSqlOutputClause(false));
        modelBuilder.Entity<CashPaymentConfirmation>().ToTable(t => t.UseSqlOutputClause(false));
        modelBuilder.Entity<CarConditionReport>().ToTable(t => t.UseSqlOutputClause(false));

        // ── User relationships ────────────────────────────────────────────────
        modelBuilder.Entity<User>()
            .HasOne(u => u.Role)
            .WithMany(r => r.Users)
            .HasForeignKey(u => u.RoleId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<UserDetail>()
            .HasOne(ud => ud.User)
            .WithOne(u => u.UserDetail)
            .HasForeignKey<UserDetail>(ud => ud.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        // ── Car relationships ─────────────────────────────────────────────────
        modelBuilder.Entity<Car>()
            .HasOne(c => c.Supplier)
            .WithMany(u => u.Cars)
            .HasForeignKey(c => c.SupplierId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Car>()
            .HasOne(c => c.CarBrand)
            .WithMany(b => b.Cars)
            .HasForeignKey(c => c.CarBrandId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Car>()
            .HasOne(c => c.FuelType)
            .WithMany(f => f.Cars)
            .HasForeignKey(c => c.FuelTypeId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Car>()
            .HasOne(c => c.Region)
            .WithMany(r => r.Cars)
            .HasForeignKey(c => c.RegionId)
            .OnDelete(DeleteBehavior.SetNull);

        modelBuilder.Entity<Car>()
            .HasOne(c => c.Status)
            .WithMany()
            .HasForeignKey(c => c.StatusId)
            .OnDelete(DeleteBehavior.Restrict);

        // ── Booking relationships ─────────────────────────────────────────────
        modelBuilder.Entity<Booking>()
            .HasOne(b => b.Customer)
            .WithMany(u => u.Bookings)
            .HasForeignKey(b => b.CustomerId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Booking>()
            .HasOne(b => b.Car)
            .WithMany(c => c.Bookings)
            .HasForeignKey(b => b.CarId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Booking>()
            .HasOne(b => b.Driver)
            .WithMany(d => d.Bookings)
            .HasForeignKey(b => b.DriverId)
            .OnDelete(DeleteBehavior.SetNull);

        modelBuilder.Entity<Booking>()
            .HasOne(b => b.Status)
            .WithMany(s => s.Bookings)
            .HasForeignKey(b => b.StatusId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Booking>()
            .HasOne(b => b.Promotion)
            .WithMany(p => p.Bookings)
            .HasForeignKey(b => b.PromotionId)
            .OnDelete(DeleteBehavior.SetNull);

        // BookingFinancial
        modelBuilder.Entity<BookingFinancial>()
            .HasOne(bf => bf.Booking)
            .WithOne(b => b.BookingFinancial)
            .HasForeignKey<BookingFinancial>(bf => bf.BookingId)
            .OnDelete(DeleteBehavior.Cascade);

        // BookingTax
        modelBuilder.Entity<BookingTax>()
            .HasOne(bt => bt.Booking)
            .WithMany(b => b.BookingTaxes)
            .HasForeignKey(bt => bt.BookingId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<BookingTax>()
            .HasOne(bt => bt.Tax)
            .WithMany(t => t.BookingTaxes)
            .HasForeignKey(bt => bt.TaxId)
            .OnDelete(DeleteBehavior.Restrict);

        // Deposit
        modelBuilder.Entity<Deposit>()
            .HasOne(d => d.Booking)
            .WithOne(b => b.Deposit)
            .HasForeignKey<Deposit>(d => d.BookingId)
            .OnDelete(DeleteBehavior.Cascade);

        // Contract
        modelBuilder.Entity<Contract>()
            .HasOne(c => c.Booking)
            .WithOne(b => b.Contract)
            .HasForeignKey<Contract>(c => c.BookingId)
            .OnDelete(DeleteBehavior.Cascade);

        // Cancellation
        modelBuilder.Entity<Cancellation>()
            .HasOne(c => c.Booking)
            .WithOne(b => b.Cancellation)
            .HasForeignKey<Cancellation>(c => c.BookingId)
            .OnDelete(DeleteBehavior.Cascade);

        // ── Rating ────────────────────────────────────────────────────────────
        modelBuilder.Entity<Rating>()
            .HasOne(r => r.Booking)
            .WithMany(b => b.Ratings)
            .HasForeignKey(r => r.BookingId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Rating>()
            .HasOne(r => r.Customer)
            .WithMany(u => u.Ratings)
            .HasForeignKey(r => r.CustomerId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Rating>()
            .HasOne(r => r.Car)
            .WithMany(c => c.Ratings)
            .HasForeignKey(r => r.CarId)
            .OnDelete(DeleteBehavior.Restrict);

        // ── Payment ───────────────────────────────────────────────────────────
        modelBuilder.Entity<Payment>()
            .HasOne(p => p.Booking)
            .WithMany(b => b.Payments)
            .HasForeignKey(p => p.BookingId)
            .OnDelete(DeleteBehavior.Cascade);

        // CashPaymentConfirmation
        modelBuilder.Entity<CashPaymentConfirmation>()
            .HasOne(c => c.Payment)
            .WithOne(p => p.CashPaymentConfirmation)
            .HasForeignKey<CashPaymentConfirmation>(c => c.PaymentId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<CashPaymentConfirmation>()
            .HasOne(c => c.Supplier)
            .WithMany(u => u.CashPaymentConfirmations)
            .HasForeignKey(c => c.SupplierId)
            .OnDelete(DeleteBehavior.Restrict);

        // ── SupplierRevenue ───────────────────────────────────────────────────
        modelBuilder.Entity<SupplierRevenue>()
            .HasOne(sr => sr.Booking)
            .WithOne(b => b.SupplierRevenue)
            .HasForeignKey<SupplierRevenue>(sr => sr.BookingId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<SupplierRevenue>()
            .HasOne(sr => sr.Supplier)
            .WithMany(u => u.SupplierRevenues)
            .HasForeignKey(sr => sr.SupplierId)
            .OnDelete(DeleteBehavior.Restrict);

        // ── Chat ──────────────────────────────────────────────────────────────
        modelBuilder.Entity<ChatMessage>()
            .HasOne(m => m.Sender)
            .WithMany(u => u.SentMessages)
            .HasForeignKey(m => m.SenderId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<ChatMessage>()
            .HasOne(m => m.Receiver)
            .WithMany(u => u.ReceivedMessages)
            .HasForeignKey(m => m.ReceiverId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<ChatMessageImage>()
            .HasOne(i => i.ChatMessage)
            .WithMany(m => m.ChatMessageImages)
            .HasForeignKey(i => i.MessageId)
            .OnDelete(DeleteBehavior.Cascade);

        // ── Notification ──────────────────────────────────────────────────────
        modelBuilder.Entity<Notification>()
            .HasOne(n => n.User)
            .WithMany(u => u.Notifications)
            .HasForeignKey(n => n.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        // ── Driver ────────────────────────────────────────────────────────────
        modelBuilder.Entity<Driver>()
            .HasOne(d => d.User)
            .WithMany(u => u.Drivers)
            .HasForeignKey(d => d.SupplierId)
            .OnDelete(DeleteBehavior.Cascade);

        // ── CarConditionReport ────────────────────────────────────────────────
        modelBuilder.Entity<CarConditionReport>()
            .HasOne(r => r.Booking)
            .WithMany(b => b.CarConditionReports)
            .HasForeignKey(r => r.BookingId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<CarConditionReport>()
            .HasOne(r => r.Car)
            .WithMany(c => c.CarConditionReports)
            .HasForeignKey(r => r.CarId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<CarConditionReport>()
            .HasOne(r => r.Reporter)
            .WithMany()
            .HasForeignKey(r => r.ReporterId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<CarConditionReport>()
            .HasOne(r => r.ConfirmedByUser)
            .WithMany()
            .HasForeignKey(r => r.ConfirmedBy)
            .OnDelete(DeleteBehavior.SetNull);

        modelBuilder.Entity<CarConditionReport>()
            .HasOne(r => r.Status)
            .WithMany(s => s.CarConditionReports)
            .HasForeignKey(r => r.StatusId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<CarConditionImage>()
            .HasOne(i => i.CarConditionReport)
            .WithMany(r => r.CarConditionImages)
            .HasForeignKey(i => i.ReportId)
            .OnDelete(DeleteBehavior.Cascade);

        // ── Favorite ──────────────────────────────────────────────────────────
        modelBuilder.Entity<Favorite>()
            .HasOne(f => f.User)
            .WithMany(u => u.Favorites)
            .HasForeignKey(f => f.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Favorite>()
            .HasOne(f => f.Car)
            .WithMany(c => c.Favorites)
            .HasForeignKey(f => f.CarId)
            .OnDelete(DeleteBehavior.Restrict);

        // ── SignUpToProvide ───────────────────────────────────────────────────
        modelBuilder.Entity<SignUpToProvide>()
            .HasOne(s => s.User)
            .WithMany(u => u.SignUpToProvides)
            .HasForeignKey(s => s.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<SignUpToProvide>()
            .HasOne(s => s.Car)
            .WithMany(c => c.SignUpToProvides)
            .HasForeignKey(s => s.CarId)
            .OnDelete(DeleteBehavior.SetNull);

        modelBuilder.Entity<SignUpToProvide>()
            .HasOne(s => s.ServiceType)
            .WithMany(st => st.SignUpToProvides)
            .HasForeignKey(s => s.ServiceTypeId)
            .OnDelete(DeleteBehavior.SetNull);

        // ── RegistrationRequest ───────────────────────────────────────────────
        // No FK to User - stores raw registration data

        // ── BankAccount ───────────────────────────────────────────────────────
        modelBuilder.Entity<BankAccount>()
            .HasOne(b => b.User)
            .WithMany(u => u.BankAccounts)
            .HasForeignKey(b => b.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        // ── UserSession ───────────────────────────────────────────────────────
        modelBuilder.Entity<UserSession>()
            .HasOne(s => s.User)
            .WithMany(u => u.UserSessions)
            .HasForeignKey(s => s.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        // ── UserActionLog ─────────────────────────────────────────────────────
        modelBuilder.Entity<UserActionLog>()
            .HasOne(l => l.User)
            .WithMany(u => u.UserActionLogs)
            .HasForeignKey(l => l.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        // ── Indexes (unique) ──────────────────────────────────────────────────
        modelBuilder.Entity<User>()
            .HasIndex(u => u.Email)
            .IsUnique();

        modelBuilder.Entity<Promotion>()
            .HasIndex(p => p.Code)
            .IsUnique();

        modelBuilder.Entity<Car>()
            .HasIndex(c => c.LicensePlate)
            .IsUnique();
    }
}
