using CarRental.API.Data;
using CarRental.API.Hubs;
using CarRental.API.Middleware;
using CarRental.API.Repositories;
using CarRental.API.Repositories.Interfaces;
using CarRental.API.Scheduler;
using CarRental.API.Security;
using CarRental.API.Services;
using CarRental.API.Services.Interfaces;
using Microsoft.AspNetCore.Authentication;
using Microsoft.EntityFrameworkCore;
using Microsoft.OpenApi.Models;

var builder = WebApplication.CreateBuilder(args);

// ── 1. Database ──────────────────────────────────────────────────────────────
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// ── 2. Authentication (JWT + Google OAuth2) ───────────────────────────────────
builder.Services.AddJwtAuthentication(builder.Configuration);

// ── 3. Authorization ──────────────────────────────────────────────────────────
builder.Services.AddAuthorization();

// ── 4. CORS ───────────────────────────────────────────────────────────────────
var allowedOrigins = builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>()
    ?? new[] { "http://localhost:5173" };

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
        policy.WithOrigins(allowedOrigins)
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials());
});

// ── 5. SignalR ────────────────────────────────────────────────────────────────
builder.Services.AddSignalR();
builder.Services.AddMemoryCache();

// ── 6. Controllers ────────────────────────────────────────────────────────────
builder.Services.AddControllers()
    .AddJsonOptions(opts =>
    {
        opts.JsonSerializerOptions.PropertyNamingPolicy = System.Text.Json.JsonNamingPolicy.CamelCase;
        opts.JsonSerializerOptions.DefaultIgnoreCondition =
            System.Text.Json.Serialization.JsonIgnoreCondition.WhenWritingNull;
    });

// ── 7. Swagger ────────────────────────────────────────────────────────────────
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "Car Rental API", Version = "v1" });
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header,
        Description = "Enter: Bearer {token}"
    });
    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference { Type = ReferenceType.SecurityScheme, Id = "Bearer" }
            },
            Array.Empty<string>()
        }
    });
});

// ── 8. Repositories ───────────────────────────────────────────────────────────
builder.Services.AddScoped<IUserRepository, UserRepository>();
builder.Services.AddScoped<ICarRepository, CarRepository>();
builder.Services.AddScoped<IBookingRepository, BookingRepository>();
builder.Services.AddScoped<IPaymentRepository, PaymentRepository>();
builder.Services.AddScoped<IChatRepository, ChatRepository>();
builder.Services.AddScoped<INotificationRepository, NotificationRepository>();
builder.Services.AddScoped<IRatingRepository, RatingRepository>();
builder.Services.AddScoped<IFavoriteRepository, FavoriteRepository>();

// ── 9. Services ───────────────────────────────────────────────────────────────
builder.Services.AddScoped<JwtService>();
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddScoped<ICarService, CarService>();
builder.Services.AddScoped<IBookingService, BookingService>();
builder.Services.AddScoped<IPaymentService, PaymentService>();
builder.Services.AddScoped<IChatService, ChatService>();
builder.Services.AddScoped<INotificationService, NotificationService>();
builder.Services.AddScoped<IRatingService, RatingService>();
builder.Services.AddScoped<IEmailService, EmailService>();
builder.Services.AddScoped<CloudinaryService>();

// ── 10. Background Services ───────────────────────────────────────────────────
builder.Services.AddHostedService<PlatformFeeScheduler>();

// ── 11. HttpContextAccessor ───────────────────────────────────────────────────
builder.Services.AddHttpContextAccessor();

// ── 12. Configure port ────────────────────────────────────────────────────────
builder.WebHost.UseUrls("http://localhost:8081");

// ═══════════════════════════════════════════════════════════════════════════
var app = builder.Build();
// ═══════════════════════════════════════════════════════════════════════════

app.UseMiddleware<ExceptionHandlingMiddleware>();

if (app.Environment.IsDevelopment() || true) // Always show Swagger
{
    app.UseSwagger();
    app.UseSwaggerUI(c => c.SwaggerEndpoint("/swagger/v1/swagger.json", "Car Rental API v1"));
}

app.UseStaticFiles();
app.UseCors("AllowFrontend");

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();
app.MapHub<ChatHub>("/hub/chat");

// Google OAuth2 initiation endpoint
app.MapGet("/api/auth/google", (HttpContext ctx) =>
{
    var redirectUrl = "/login/oauth2/code/google";
    var properties = new AuthenticationProperties { RedirectUri = redirectUrl };
    return Results.Challenge(properties, new[] { "Google" });
}).AllowAnonymous();

// Verify DB on startup
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
    try
    {
        await db.Database.CanConnectAsync();
        Console.WriteLine("✓ Connected to CarRentalDB");
    }
    catch (Exception ex)
    {
        Console.WriteLine($"✗ Database error: {ex.Message}");
    }
}

Console.WriteLine("Car Rental API http://localhost:8081");
Console.WriteLine("Swagger: http://localhost:8081/swagger");

app.Run();
