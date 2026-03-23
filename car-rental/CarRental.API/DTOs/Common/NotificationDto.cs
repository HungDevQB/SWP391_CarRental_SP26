namespace CarRental.API.DTOs.Common;

public class NotificationDto
{
    public int NotificationId { get; set; }
    public int UserId { get; set; }
    public string Message { get; set; } = string.Empty;
    public string? Type { get; set; }
    public DateTime CreatedAt { get; set; }
}
