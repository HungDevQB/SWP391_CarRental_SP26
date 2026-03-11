using CarRental.API.Data;
using CarRental.API.Models;
using CarRental.API.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace CarRental.API.Repositories;

public class ChatRepository : BaseRepository<ChatMessage>, IChatRepository
{
    public ChatRepository(ApplicationDbContext context) : base(context) { }

    public async Task<IEnumerable<ChatMessage>> GetConversationAsync(int userId1, int userId2, int page, int size) =>
        await _dbSet
            .Include(m => m.Sender)
            .Include(m => m.ChatMessageImages)
            .Where(m => (m.SenderId == userId1 && m.ReceiverId == userId2) ||
                        (m.SenderId == userId2 && m.ReceiverId == userId1))
            .OrderByDescending(m => m.SentAt)
            .Skip(page * size).Take(size)
            .ToListAsync();

    public async Task<IEnumerable<(int UserId, ChatMessage LastMessage, int UnreadCount)>> GetConversationsAsync(int userId)
    {
        // Get distinct conversation partners
        var partnerIds = await _dbSet
            .Where(m => m.SenderId == userId || m.ReceiverId == userId)
            .Select(m => m.SenderId == userId ? m.ReceiverId : m.SenderId)
            .Distinct()
            .ToListAsync();

        var result = new List<(int, ChatMessage, int)>();
        foreach (var partnerId in partnerIds)
        {
            var lastMsg = await _dbSet
                .Where(m => (m.SenderId == userId && m.ReceiverId == partnerId) ||
                            (m.SenderId == partnerId && m.ReceiverId == userId))
                .OrderByDescending(m => m.SentAt)
                .FirstOrDefaultAsync();

            if (lastMsg == null) continue;

            var unread = await _dbSet.CountAsync(m => m.SenderId == partnerId &&
                                                       m.ReceiverId == userId &&
                                                       !m.IsRead);
            result.Add((partnerId, lastMsg, unread));
        }

        return result.OrderByDescending(r => r.Item2.SentAt);
    }

    public async Task MarkAsReadAsync(int senderId, int receiverId)
    {
        var messages = await _dbSet
            .Where(m => m.SenderId == senderId && m.ReceiverId == receiverId && !m.IsRead)
            .ToListAsync();

        messages.ForEach(m => m.IsRead = true);
        await _context.SaveChangesAsync();
    }

    public async Task<int> GetUnreadCountAsync(int userId) =>
        await _dbSet.CountAsync(m => m.ReceiverId == userId && !m.IsRead);
}
