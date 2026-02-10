// JwtService - JWT token generation and validation
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.IdentityModel.Tokens;

namespace CarRental.API.Security;

public class JwtService
{
    private const string Secret = "Th1s1sAS3cur3K3yF0rJWT2025!@#CarRentalSecretKey_MustBe64CharsLongForHS512Algorithm!";
    private const int ExpiryHours = 24;

    private static SymmetricSecurityKey GetKey() =>
        new(Encoding.UTF8.GetBytes(Secret));

    public string GenerateToken(int userId, string email, string role)
    {
        var claims = new[]
        {
            new Claim(JwtRegisteredClaimNames.Sub, email),
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
            new Claim("userId", userId.ToString()),
            new Claim("role", $"ROLE_{role.ToUpper()}"),
            new Claim(ClaimTypes.Role, role)
        };

        var credentials = new SigningCredentials(GetKey(), SecurityAlgorithms.HmacSha512);

        var token = new JwtSecurityToken(
            issuer: "CarRentalAPI",
            audience: "CarRentalClient",
            claims: claims,
            expires: DateTime.UtcNow.AddHours(ExpiryHours),
            signingCredentials: credentials
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    public ClaimsPrincipal? ValidateToken(string token)
    {
        try
        {
            var handler = new JwtSecurityTokenHandler();
            var result = handler.ValidateToken(token, new TokenValidationParameters
            {
                ValidateIssuerSigningKey = true,
                IssuerSigningKey = GetKey(),
                ValidateIssuer = true,
                ValidIssuer = "CarRentalAPI",
                ValidateAudience = true,
                ValidAudience = "CarRentalClient",
                ValidateLifetime = true,
                ClockSkew = TimeSpan.Zero
            }, out _);
            return result;
        }
        catch
        {
            return null;
        }
    }

    public long GetExpiresAtMs() =>
        new DateTimeOffset(DateTime.UtcNow.AddHours(ExpiryHours)).ToUnixTimeMilliseconds();

    public int? GetUserIdFromToken(string token)
    {
        var principal = ValidateToken(token);
        var claim = principal?.FindFirst("userId");
        return claim != null && int.TryParse(claim.Value, out var id) ? id : null;
    }
}
