using CarRental.API.DTOs.Common;
using CarRental.API.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CarRental.API.Controllers;

[ApiController]
[Route("api/notifications")]
[Authorize]
public class NotificationController : ControllerBase
{
    private readonly INotificationService _notificationService;
    private int CurrentUserId => int.Parse(User.FindFirst("userId")?.Value ?? "0");

    public NotificationController(INotificationService notificationService)
    {
        _notificationService = notificationService;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var items = await _notificationService.GetByUserAsync(CurrentUserId);
        return Ok(ApiResponse<IEnumerable<NotificationDto>>.Ok(items));
    }

    [HttpPatch("mark-all-read")]
    public async Task<IActionResult> MarkAllRead()
    {
        await _notificationService.MarkAllReadAsync(CurrentUserId);
        return Ok(ApiResponse.OkNoData("Đã đánh dấu tất cả là đã đọc"));
    }

    [HttpGet("unread-count")]
    public async Task<IActionResult> GetUnreadCount()
    {
        var count = await _notificationService.GetUnreadCountAsync(CurrentUserId);
        return Ok(ApiResponse<int>.Ok(count));
    }
}

