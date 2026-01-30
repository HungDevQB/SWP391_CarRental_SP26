using CarRental.API.Models;

namespace CarRental.API.Repositories.Interfaces;

public interface IChatRepository : IBaseRepository<ChatMessage>
{
    Task<IEnumerable<ChatMessage>> GetConversationAsync(int userId1, int userId2, int page, int size);
    Task<IEnumerable<(int UserId, ChatMessage LastMessage, int UnreadCount)>> GetConversationsAsync(int userId);
    Task MarkAsReadAsync(int senderId, int receiverId);
    Task<int> GetUnreadCountAsync(int userId);
}
