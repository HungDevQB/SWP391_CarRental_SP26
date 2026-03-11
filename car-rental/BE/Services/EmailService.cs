using CarRental.API.Services.Interfaces;
using MailKit.Net.Smtp;
using MailKit.Security;
using MimeKit;

namespace CarRental.API.Services;

public class EmailService : IEmailService
{
    private readonly IConfiguration _config;
    private readonly ILogger<EmailService> _logger;

    public EmailService(IConfiguration config, ILogger<EmailService> logger)
    {
        _config = config;
        _logger = logger;
    }

    public async Task SendAsync(string toEmail, string toName, string subject, string htmlBody)
    {
        try
        {
            var message = new MimeMessage();
            message.From.Add(new MailboxAddress(
                _config["Email:FromName"] ?? "Car Rental",
                _config["Email:FromAddress"] ?? "noreply@carrental.com"));
            message.To.Add(new MailboxAddress(toName, toEmail));
            message.Subject = subject;
            message.Body = new TextPart("html") { Text = htmlBody };

            using var client = new SmtpClient();
            await client.ConnectAsync(
                _config["Email:SmtpHost"] ?? "smtp.gmail.com",
                int.Parse(_config["Email:SmtpPort"] ?? "587"),
                SecureSocketOptions.StartTls);

            await client.AuthenticateAsync(
                _config["Email:Username"],
                _config["Email:Password"]);

            await client.SendAsync(message);
            await client.DisconnectAsync(true);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send email to {Email}", toEmail);
        }
    }

    public async Task SendBookingConfirmationAsync(string toEmail, string toName, int bookingId,
        DateTime startDate, DateTime endDate, string carInfo, decimal totalPrice)
    {
        var html = $@"
            <h2>Xác nhận đặt xe thành công</h2>
            <p>Xin chào {toName},</p>
            <p>Đơn đặt xe #{bookingId} của bạn đã được xác nhận.</p>
            <ul>
                <li><b>Xe:</b> {carInfo}</li>
                <li><b>Ngày nhận:</b> {startDate:dd/MM/yyyy}</li>
                <li><b>Ngày trả:</b> {endDate:dd/MM/yyyy}</li>
                <li><b>Tổng tiền:</b> {totalPrice:N0} VND</li>
            </ul>
            <p>Cảm ơn bạn đã sử dụng dịch vụ Car Rental!</p>";

        await SendAsync(toEmail, toName, $"Xác nhận đặt xe #{bookingId}", html);
    }

    public async Task SendPasswordResetAsync(string toEmail, string toName, string resetToken)
    {
        var html = $@"
            <h2>Đặt lại mật khẩu</h2>
            <p>Xin chào {toName},</p>
            <p>Mã đặt lại mật khẩu của bạn: <b>{resetToken}</b></p>
            <p>Mã có hiệu lực trong 30 phút.</p>";

        await SendAsync(toEmail, toName, "Đặt lại mật khẩu - Car Rental", html);
    }

    public async Task SendOtpAsync(string toEmail, string otp)
    {
        var html = $@"
            <h2>Mã xác thực OTP</h2>
            <p>Mã OTP của bạn: <b style='font-size:24px'>{otp}</b></p>
            <p>Mã có hiệu lực trong 5 phút.</p>";

        await SendAsync(toEmail, toEmail, "Mã OTP - Car Rental", html);
    }

    public async Task SendBookingStatusUpdateAsync(string toEmail, string toName, int bookingId, string newStatus)
    {
        var html = $@"
            <h2>Cập nhật trạng thái đặt xe</h2>
            <p>Xin chào {toName},</p>
            <p>Đơn đặt xe #{bookingId} của bạn đã được cập nhật trạng thái: <b>{newStatus}</b></p>";

        await SendAsync(toEmail, toName, $"Cập nhật đơn đặt xe #{bookingId}", html);
    }
}
