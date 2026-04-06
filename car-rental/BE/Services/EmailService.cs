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
        var days = Math.Max(1, (int)(endDate - startDate).TotalDays);
        var html = $@"
<!DOCTYPE html>
<html lang=""vi"">
<head><meta charset=""UTF-8""><meta name=""viewport"" content=""width=device-width,initial-scale=1""></head>
<body style=""margin:0;padding:0;background:#f4f6fb;font-family:'Segoe UI',Arial,sans-serif"">
  <table width=""100%"" cellpadding=""0"" cellspacing=""0"" style=""background:#f4f6fb;padding:32px 0"">
    <tr><td align=""center"">
      <table width=""600"" cellpadding=""0"" cellspacing=""0"" style=""background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08)"">
        <!-- Header -->
        <tr>
          <td style=""background:linear-gradient(135deg,#2563eb 0%,#7c3aed 100%);padding:36px 40px;text-align:center"">
            <div style=""font-size:32px;margin-bottom:8px"">🚗</div>
            <h1 style=""color:#fff;margin:0;font-size:24px;font-weight:700;letter-spacing:0.5px"">Đặt xe thành công!</h1>
            <p style=""color:rgba(255,255,255,0.85);margin:8px 0 0;font-size:14px"">Cảm ơn bạn đã tin tưởng dịch vụ Car Rental</p>
          </td>
        </tr>
        <!-- Greeting -->
        <tr>
          <td style=""padding:32px 40px 0"">
            <p style=""margin:0;font-size:15px;color:#374151"">Xin chào <b>{toName}</b>,</p>
            <p style=""margin:12px 0 0;font-size:15px;color:#374151"">
              Đơn đặt xe <b style=""color:#2563eb"">#{bookingId}</b> của bạn đã được xác nhận thành công. Dưới đây là chi tiết đơn hàng:
            </p>
          </td>
        </tr>
        <!-- Booking details -->
        <tr>
          <td style=""padding:24px 40px"">
            <table width=""100%"" cellpadding=""0"" cellspacing=""0"" style=""background:#f8fafc;border-radius:12px;overflow:hidden;border:1px solid #e5e7eb"">
              <tr style=""background:#eff6ff"">
                <td colspan=""2"" style=""padding:14px 20px;font-weight:700;color:#1e40af;font-size:14px;letter-spacing:0.3px"">
                  📋 THÔNG TIN ĐẶT XE
                </td>
              </tr>
              <tr>
                <td style=""padding:12px 20px;border-top:1px solid #e5e7eb;color:#6b7280;font-size:13px;width:40%"">🚘 Xe thuê</td>
                <td style=""padding:12px 20px;border-top:1px solid #e5e7eb;font-weight:600;color:#111827;font-size:13px"">{carInfo}</td>
              </tr>
              <tr style=""background:#f9fafb"">
                <td style=""padding:12px 20px;border-top:1px solid #e5e7eb;color:#6b7280;font-size:13px"">📅 Ngày nhận xe</td>
                <td style=""padding:12px 20px;border-top:1px solid #e5e7eb;font-weight:600;color:#111827;font-size:13px"">{startDate:HH:mm, dd/MM/yyyy}</td>
              </tr>
              <tr>
                <td style=""padding:12px 20px;border-top:1px solid #e5e7eb;color:#6b7280;font-size:13px"">📅 Ngày trả xe</td>
                <td style=""padding:12px 20px;border-top:1px solid #e5e7eb;font-weight:600;color:#111827;font-size:13px"">{endDate:HH:mm, dd/MM/yyyy}</td>
              </tr>
              <tr style=""background:#f9fafb"">
                <td style=""padding:12px 20px;border-top:1px solid #e5e7eb;color:#6b7280;font-size:13px"">⏱ Số ngày thuê</td>
                <td style=""padding:12px 20px;border-top:1px solid #e5e7eb;font-weight:600;color:#111827;font-size:13px"">{days} ngày</td>
              </tr>
              <tr style=""background:#fef3c7"">
                <td style=""padding:14px 20px;border-top:2px solid #fbbf24;color:#92400e;font-size:14px;font-weight:700"">💰 Tổng tiền</td>
                <td style=""padding:14px 20px;border-top:2px solid #fbbf24;font-weight:800;color:#d97706;font-size:16px"">{totalPrice:N0} VNĐ</td>
              </tr>
            </table>
          </td>
        </tr>
        <!-- Next steps -->
        <tr>
          <td style=""padding:0 40px 24px"">
            <table width=""100%"" cellpadding=""0"" cellspacing=""0"" style=""background:#f0fdf4;border-radius:12px;border:1px solid #bbf7d0"">
              <tr>
                <td style=""padding:16px 20px"">
                  <p style=""margin:0 0 8px;font-weight:700;color:#166534;font-size:13px"">✅ CÁC BƯỚC TIẾP THEO</p>
                  <ol style=""margin:0;padding-left:18px;color:#374151;font-size:13px;line-height:1.8"">
                    <li>Đăng nhập hệ thống để xem và ký <b>hợp đồng thuê xe</b></li>
                    <li>Upload <b>bằng lái xe</b> để chủ xe xác minh trước khi nhận xe</li>
                    <li>Nhận xe đúng thời gian và địa điểm đã thỏa thuận</li>
                  </ol>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <!-- Footer -->
        <tr>
          <td style=""background:#f8fafc;padding:24px 40px;text-align:center;border-top:1px solid #e5e7eb"">
            <p style=""margin:0;font-size:12px;color:#9ca3af"">
              © 2026 Car Rental · Hệ thống thuê xe trực tuyến<br>
              Email này được gửi tự động, vui lòng không trả lời.
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>";

        await SendAsync(toEmail, toName, $"✅ Xác nhận đặt xe #{bookingId} - Car Rental", html);
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

    public async Task SendContractNotificationAsync(string toEmail, string toName, string contractCode, int bookingId, string carInfo, string role, string? contractTerms = null, string? nationalIdFront = null, string? nationalIdBack = null, string? licenseFront = null, string? licenseBack = null)
    {
        var roleLabel = role == "supplier" ? "Chủ xe (Bên A)" : "Khách hàng (Bên B)";
        var action = role == "supplier"
            ? "Đăng nhập hệ thống để xem chi tiết và ký xác nhận hợp đồng."
            : "Đăng nhập hệ thống để xem và ký hợp đồng. Nhớ upload bằng lái xe để được xác minh.";
        var roleColor = role == "supplier" ? "#7c3aed" : "#2563eb";
        var roleIcon = role == "supplier" ? "🔑" : "👤";

        var contractSection = "";
        if (!string.IsNullOrEmpty(contractTerms))
        {
            var escaped = contractTerms.Replace("&", "&amp;").Replace("<", "&lt;").Replace(">", "&gt;");
            contractSection = $@"
        <!-- Contract text -->
        <tr>
          <td style=""padding:0 40px 24px"">
            <p style=""margin:0 0 12px;font-weight:700;color:#374151;font-size:13px"">📄 NỘI DUNG HỢP ĐỒNG</p>
            <div style=""background:#f8fafc;border:1px solid #e5e7eb;border-radius:8px;padding:20px;font-family:monospace;font-size:11px;color:#374151;white-space:pre-wrap;line-height:1.7"">{escaped}</div>
          </td>
        </tr>";
        }

        var html = $@"
<!DOCTYPE html>
<html lang=""vi"">
<head><meta charset=""UTF-8""></head>
<body style=""margin:0;padding:0;background:#f4f6fb;font-family:'Segoe UI',Arial,sans-serif"">
  <table width=""100%"" cellpadding=""0"" cellspacing=""0"" style=""background:#f4f6fb;padding:32px 0"">
    <tr><td align=""center"">
      <table width=""640"" cellpadding=""0"" cellspacing=""0"" style=""background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08)"">
        <!-- Header -->
        <tr>
          <td style=""background:linear-gradient(135deg,{roleColor} 0%,#1e40af 100%);padding:36px 40px;text-align:center"">
            <div style=""font-size:40px;margin-bottom:8px"">📋</div>
            <h1 style=""color:#fff;margin:0;font-size:22px;font-weight:700"">Hợp đồng thuê xe đã được tạo</h1>
            <p style=""color:rgba(255,255,255,0.85);margin:8px 0 0;font-size:14px"">Mã hợp đồng: <b>{contractCode}</b></p>
          </td>
        </tr>
        <!-- Info -->
        <tr>
          <td style=""padding:28px 40px 16px"">
            <p style=""margin:0;font-size:15px;color:#374151"">Xin chào <b>{toName}</b>,</p>
            <p style=""margin:10px 0 0;font-size:14px;color:#374151"">
              Hợp đồng thuê xe cho đơn đặt xe <b style=""color:{roleColor}"">#{bookingId}</b> đã được tạo thành công.
            </p>
          </td>
        </tr>
        <!-- Details -->
        <tr>
          <td style=""padding:0 40px 20px"">
            <table width=""100%"" cellpadding=""0"" cellspacing=""0"" style=""background:#f8fafc;border-radius:12px;border:1px solid #e5e7eb"">
              <tr style=""background:#eff6ff"">
                <td colspan=""2"" style=""padding:12px 20px;font-weight:700;color:#1e40af;font-size:13px"">📌 THÔNG TIN HỢP ĐỒNG</td>
              </tr>
              <tr>
                <td style=""padding:11px 20px;border-top:1px solid #e5e7eb;color:#6b7280;font-size:13px;width:40%"">Mã hợp đồng</td>
                <td style=""padding:11px 20px;border-top:1px solid #e5e7eb;font-weight:600;color:#111827;font-size:13px;font-family:monospace"">{contractCode}</td>
              </tr>
              <tr style=""background:#f9fafb"">
                <td style=""padding:11px 20px;border-top:1px solid #e5e7eb;color:#6b7280;font-size:13px"">🚗 Xe thuê</td>
                <td style=""padding:11px 20px;border-top:1px solid #e5e7eb;font-weight:600;color:#111827;font-size:13px"">{carInfo}</td>
              </tr>
              <tr>
                <td style=""padding:11px 20px;border-top:1px solid #e5e7eb;color:#6b7280;font-size:13px"">Vai trò của bạn</td>
                <td style=""padding:11px 20px;border-top:1px solid #e5e7eb;font-weight:600;font-size:13px"">
                  <span style=""background:{roleColor};color:#fff;padding:3px 10px;border-radius:20px;font-size:12px"">{roleIcon} {roleLabel}</span>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <!-- Action required -->
        <tr>
          <td style=""padding:0 40px 20px"">
            <div style=""background:#fef3c7;border:1px solid #fbbf24;border-radius:12px;padding:16px 20px"">
              <p style=""margin:0;font-weight:700;color:#92400e;font-size:13px"">⚠️ HÀNH ĐỘNG CẦN THỰC HIỆN</p>
              <p style=""margin:8px 0 0;color:#78350f;font-size:13px"">{action}</p>
            </div>
          </td>
        </tr>
        {contractSection}
        {BuildImageSection(nationalIdFront, nationalIdBack, licenseFront, licenseBack)}
        <!-- Footer -->
        <tr>
          <td style=""background:#f8fafc;padding:20px 40px;text-align:center;border-top:1px solid #e5e7eb"">
            <p style=""margin:0;font-size:12px;color:#9ca3af"">
              © 2026 Car Rental · Email này được gửi tự động, vui lòng không trả lời.
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>";

        await SendAsync(toEmail, toName, $"📋 Hợp đồng thuê xe {contractCode} - Car Rental", html);
    }

    private static string BuildImageSection(string? nationalIdFront, string? nationalIdBack, string? licenseFront, string? licenseBack)
    {
        var imgs = new List<(string label, string url)>();
        if (!string.IsNullOrEmpty(nationalIdFront)) imgs.Add(("CCCD mặt trước", nationalIdFront));
        if (!string.IsNullOrEmpty(nationalIdBack)) imgs.Add(("CCCD mặt sau", nationalIdBack));
        if (!string.IsNullOrEmpty(licenseFront)) imgs.Add(("Bằng lái mặt trước", licenseFront));
        if (!string.IsNullOrEmpty(licenseBack)) imgs.Add(("Bằng lái mặt sau", licenseBack));
        if (imgs.Count == 0) return "";

        var cells = string.Join("", imgs.Select(i => $@"
          <td style=""padding:8px;text-align:center;width:50%"">
            <p style=""margin:0 0 6px;font-size:11px;color:#6b7280"">{i.label}</p>
            <a href=""{i.url}"" target=""_blank"">
              <img src=""{i.url}"" alt=""{i.label}"" style=""max-width:240px;width:100%;border-radius:8px;border:1px solid #e5e7eb"" />
            </a>
          </td>"));

        return $@"
        <tr>
          <td style=""padding:0 40px 24px"">
            <p style=""margin:0 0 12px;font-weight:700;color:#374151;font-size:13px"">📎 Ảnh giấy tờ tùy thân của người thuê</p>
            <table width=""100%"" cellpadding=""0"" cellspacing=""0""><tr>{cells}</tr></table>
          </td>
        </tr>";
    }
}
