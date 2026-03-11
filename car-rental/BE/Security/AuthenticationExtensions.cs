using System.Security.Claims;
using System.Text;
using CarRental.API.Data;
using CarRental.API.Models;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

namespace CarRental.API.Security;

public static class AuthenticationExtensions
{
    public static IServiceCollection AddJwtAuthentication(this IServiceCollection services, IConfiguration config)
    {
        var jwtSecret = config["Jwt:Secret"] ?? throw new InvalidOperationException("Jwt:Secret not configured");

        services.AddAuthentication(options =>
        {
            options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
            options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
        })
        .AddJwtBearer(options =>
        {
            options.TokenValidationParameters = new TokenValidationParameters
            {
                ValidateIssuerSigningKey = true,
                IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSecret)),
                ValidateIssuer = true,
                ValidIssuer = "CarRentalAPI",
                ValidateAudience = true,
                ValidAudience = "CarRentalClient",
                ValidateLifetime = true,
                ClockSkew = TimeSpan.Zero
            };

            // Support JWT in SignalR query string
            options.Events = new JwtBearerEvents
            {
                OnMessageReceived = context =>
                {
                    var accessToken = context.Request.Query["access_token"];
                    var path = context.HttpContext.Request.Path;
                    if (!string.IsNullOrEmpty(accessToken) && path.StartsWithSegments("/hub"))
                    {
                        context.Token = accessToken;
                    }
                    return Task.CompletedTask;
                }
            };
        });

        var googleClientSecret = config["Google:ClientSecret"];
        if (!string.IsNullOrEmpty(googleClientSecret))
        {
            services.AddAuthentication()
            .AddGoogle(options =>
            {
                options.ClientId = config["Google:ClientId"] ?? "";
                options.ClientSecret = googleClientSecret;
                options.CallbackPath = "/login/oauth2/code/google";

                options.Events.OnTicketReceived = async ctx =>
                {
                    var db = ctx.HttpContext.RequestServices.GetRequiredService<ApplicationDbContext>();
                    var jwtService = ctx.HttpContext.RequestServices.GetRequiredService<JwtService>();

                    var email = ctx.Principal?.FindFirst(ClaimTypes.Email)?.Value;
                    var name = ctx.Principal?.FindFirst(ClaimTypes.Name)?.Value;

                    if (string.IsNullOrEmpty(email))
                    {
                        ctx.Response.Redirect("http://localhost:5173/login?error=no_email");
                        ctx.HandleResponse();
                        return;
                    }

                    var user = await db.Users.IgnoreQueryFilters()
                        .Include(u => u.Role)
                        .FirstOrDefaultAsync(u => u.Email == email);

                    if (user == null)
                    {
                        var customerRole = await db.Roles.FirstOrDefaultAsync(r => r.RoleName == "customer");
                        user = new User
                        {
                            Username = email, // Use email as username since DB requires it
                            Email = email,
                            FullName = name,
                            Phone = string.Empty,
                            CountryCode = "+84",
                            RoleId = customerRole?.RoleId ?? 3,
                            StatusId = 1,
                            LoginSource = "google",
                            IsActive = true
                        };
                        db.Users.Add(user);
                        await db.SaveChangesAsync();
                        await db.Entry(user).Reference(u => u.Role).LoadAsync();
                    }

                    var role = user.Role?.RoleName ?? "customer";
                    var token = jwtService.GenerateToken(user.UserId, user.Email, role);
                    var expiresAt = jwtService.GetExpiresAtMs();

                    ctx.Response.Redirect(
                        $"http://localhost:5173/oauth2/redirect?token={token}" +
                        $"&username={Uri.EscapeDataString(user.Email)}" +
                        $"&expiresAt={expiresAt}&role={role}");
                    ctx.HandleResponse();
                };
            });
        }

        return services;
    }
}
