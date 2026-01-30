using CarRental.API.DTOs.Chat;
using CarRental.API.DTOs.Common;
using CarRental.API.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CarRental.API.Controllers;

[ApiController]
[Route("api/chat")]
[Authorize]
public class ChatController : ControllerBase
{
    private readonly IChatService _chatService;
    private int CurrentUserId => int.Parse(User.FindFirst("userId")?.Value ?? "0");

    public ChatController(IChatService chatService)
    {
        _chatService = chatService;
    }

    [HttpPost("send")]
    public async Task<IActionResult> Send([FromBody] SendMessageRequest request)
    {
        var msg = await _chatService.SendMessageAsync(CurrentUserId, request);
        return Ok(ApiResponse<ChatMessageDto>.Ok(msg));
    }

    [HttpGet("conversation/{partnerId:int}")]
    public async Task<IActionResult> GetConversation(int partnerId,
        [FromQuery] int page = 0, [FromQuery] int size = 20)
    {
        var messages = await _chatService.GetConversationAsync(CurrentUserId, partnerId, page, size);
        return Ok(ApiResponse<IEnumerable<ChatMessageDto>>.Ok(messages));
    }

    [HttpGet("conversations")]
    public async Task<IActionResult> GetConversations()
    {
        var convs = await _chatService.GetConversationsAsync(CurrentUserId);
        return Ok(ApiResponse<IEnumerable<ChatConversationDto>>.Ok(convs));
    }

    [HttpPost("mark-read/{senderId:int}")]
    public async Task<IActionResult> MarkRead(int senderId)
    {
        await _chatService.MarkAsReadAsync(senderId, CurrentUserId);
        return Ok(ApiResponse.OkNoData("Đã đánh dấu đã đọc"));
    }

    [HttpGet("unread-count")]
    public async Task<IActionResult> GetUnreadCount()
    {
        var count = await _chatService.GetUnreadCountAsync(CurrentUserId);
        return Ok(ApiResponse<int>.Ok(count));
    }
}
