// ChatService - message handling and chat room management
using CarRental.API.Data;
using CarRental.API.DTOs.Chat;
using CarRental.API.Models;
using CarRental.API.Repositories.Interfaces;
using CarRental.API.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace CarRental.API.Services;

public class ChatService : IChatService
{
    private readonly IChatRepository _chatRepo;
    private readonly ApplicationDbContext _context;

    public ChatService(IChatRepository chatRepo, ApplicationDbContext context)
    {
        _chatRepo = chatRepo;
        _context = context;
    }

    public async Task<ChatMessageDto> SendMessageAsync(int senderId, SendMessageRequest request)
    {
        var message = new ChatMessage
        {
            SenderId = senderId,
            ReceiverId = request.ReceiverId,
            MessageText = request.MessageText,
            MessageType = request.MessageType,
            SentAt = DateTime.UtcNow
        };

        await _chatRepo.AddAsync(message);
        await _chatRepo.SaveChangesAsync();

        if (request.ImageUrls?.Any() == true)
        {
            var images = request.ImageUrls.Select(url => new ChatMessageImage
            {
                MessageId = message.MessageId,
                ImageUrl = url,
                UploadDate = DateTime.UtcNow
            });
            await _context.ChatMessageImages.AddRangeAsync(images);
            await _context.SaveChangesAsync();
        }

        var sender = await _context.Users.FindAsync(senderId);
        return new ChatMessageDto
        {
            MessageId = message.MessageId,
            SenderId = senderId,
            SenderName = sender?.FullName,
            SenderAvatar = sender?.AvatarUrl,
            ReceiverId = request.ReceiverId,
            MessageText = request.MessageText,
            SentAt = message.SentAt,
            IsRead = false,
            MessageType = request.MessageType,
            ImageUrls = request.ImageUrls ?? new()
        };
    }

    public async Task<IEnumerable<ChatMessageDto>> GetConversationAsync(int userId, int partnerId, int page, int size)
    {
        var messages = await _chatRepo.GetConversationAsync(userId, partnerId, page, size);
        return messages.Select(m => new ChatMessageDto
        {
            MessageId = m.MessageId,
            SenderId = m.SenderId,
            SenderName = m.Sender?.FullName,
            SenderAvatar = m.Sender?.AvatarUrl,
            ReceiverId = m.ReceiverId,
            MessageText = m.MessageText,
            SentAt = m.SentAt,
            IsRead = m.IsRead,
            MessageType = m.MessageType,
            ImageUrls = m.ChatMessageImages.Select(i => i.ImageUrl).ToList()
        });
    }

    public async Task<IEnumerable<ChatConversationDto>> GetConversationsAsync(int userId)
    {
        var conversations = await _chatRepo.GetConversationsAsync(userId);
        var result = new List<ChatConversationDto>();

        foreach (var (partnerId, lastMsg, unread) in conversations)
        {
            var partner = await _context.Users.FindAsync(partnerId);
            result.Add(new ChatConversationDto
            {
                UserId = partnerId,
                UserName = partner?.FullName,
                AvatarUrl = partner?.AvatarUrl,
                LastMessage = lastMsg.MessageText,
                LastMessageTime = lastMsg.SentAt,
                UnreadCount = unread
            });
        }

        return result;
    }

    public async Task MarkAsReadAsync(int senderId, int receiverId) =>
        await _chatRepo.MarkAsReadAsync(senderId, receiverId);

    public async Task<int> GetUnreadCountAsync(int userId) =>
        await _chatRepo.GetUnreadCountAsync(userId);
}
