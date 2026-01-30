using System.ComponentModel.DataAnnotations;

namespace CarRental.API.DTOs.Chat;

public class ChatMessageDto
{
    public int MessageId { get; set; }
    public int SenderId { get; set; }
    public string? SenderName { get; set; }
    public string? SenderAvatar { get; set; }
    public int ReceiverId { get; set; }
    public string? ReceiverName { get; set; }
    public string? MessageText { get; set; }
    public DateTime SentAt { get; set; }
    public bool IsRead { get; set; }
    public string MessageType { get; set; } = "text";
    public List<string> ImageUrls { get; set; } = new();
}

public class SendMessageRequest
{
    [Required]
    public int ReceiverId { get; set; }
    public string? MessageText { get; set; }
    public string MessageType { get; set; } = "text";
    public List<string>? ImageUrls { get; set; }
}

public class ChatConversationDto
{
    public int UserId { get; set; }
    public string? UserName { get; set; }
    public string? AvatarUrl { get; set; }
    public string? LastMessage { get; set; }
    public DateTime? LastMessageTime { get; set; }
    public int UnreadCount { get; set; }
}

public class TypingIndicatorDto
{
    public int SenderId { get; set; }
    public int ReceiverId { get; set; }
    public bool IsTyping { get; set; }
}
