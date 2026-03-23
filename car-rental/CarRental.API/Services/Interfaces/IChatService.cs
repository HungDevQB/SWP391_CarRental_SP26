using CarRental.API.DTOs.Chat;

namespace CarRental.API.Services.Interfaces;

public interface IChatService
{
    Task<ChatMessageDto> SendMessageAsync(int senderId, SendMessageRequest request);
    Task<IEnumerable<ChatMessageDto>> GetConversationAsync(int userId, int partnerId, int page, int size);
    Task<IEnumerable<ChatConversationDto>> GetConversationsAsync(int userId);
    Task MarkAsReadAsync(int senderId, int receiverId);
    Task<int> GetUnreadCountAsync(int userId);
}
