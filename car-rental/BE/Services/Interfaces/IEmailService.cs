namespace CarRental.API.Services.Interfaces;

public interface IEmailService
{
    Task SendAsync(string toEmail, string toName, string subject, string htmlBody);
    Task SendBookingConfirmationAsync(string toEmail, string toName, int bookingId, DateTime startDate, DateTime endDate, string carInfo, decimal totalPrice);
    Task SendPasswordResetAsync(string toEmail, string toName, string resetToken);
    Task SendOtpAsync(string toEmail, string otp);
    Task SendBookingStatusUpdateAsync(string toEmail, string toName, int bookingId, string newStatus);
    Task SendContractNotificationAsync(string toEmail, string toName, string contractCode, int bookingId, string carInfo, string role, string? contractTerms = null, string? nationalIdFront = null, string? nationalIdBack = null, string? licenseFront = null, string? licenseBack = null);
}
