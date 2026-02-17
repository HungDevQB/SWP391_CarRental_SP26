// ChatHub - SignalR hub for real-time messaging
using CarRental.API.DTOs.Chat;
using CarRental.API.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;

namespace CarRental.API.Hubs;

[Authorize]
public class ChatHub : Hub
{
    private readonly IChatService _chatService;
    private static readonly Dictionary<int, string> _connections = new();

    public ChatHub(IChatService chatService)
    {
        _chatService = chatService;
    }

    public override async Task OnConnectedAsync()
    {
        var userId = GetCurrentUserId();
        if (userId > 0)
        {
            _connections[userId] = Context.ConnectionId;
            await Groups.AddToGroupAsync(Context.ConnectionId, $"user_{userId}");
        }
        await base.OnConnectedAsync();
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        var userId = GetCurrentUserId();
        if (userId > 0) _connections.Remove(userId);
        await base.OnDisconnectedAsync(exception);
    }

    public async Task SendMessage(SendMessageRequest request)
    {
        var senderId = GetCurrentUserId();
        var message = await _chatService.SendMessageAsync(senderId, request);

        // Send to receiver
        await Clients.Group($"user_{request.ReceiverId}").SendAsync("ReceiveMessage", message);
        // Echo back to sender
        await Clients.Caller.SendAsync("MessageSent", message);
    }

    public async Task SendTyping(int receiverId, bool isTyping)
    {
        var senderId = GetCurrentUserId();
        var indicator = new TypingIndicatorDto
        {
            SenderId = senderId,
            ReceiverId = receiverId,
            IsTyping = isTyping
        };
        await Clients.Group($"user_{receiverId}").SendAsync("TypingIndicator", indicator);
    }

    public async Task MarkRead(int senderId)
    {
        var receiverId = GetCurrentUserId();
        await _chatService.MarkAsReadAsync(senderId, receiverId);
        await Clients.Group($"user_{senderId}").SendAsync("MessagesRead", receiverId);
    }

    private int GetCurrentUserId()
    {
        var claim = Context.User?.FindFirst("userId");
        return claim != null && int.TryParse(claim.Value, out var id) ? id : 0;
    }
}
